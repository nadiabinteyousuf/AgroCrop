
import ee
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import date, timedelta


app = Flask(__name__)
CORS(app)

NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
GEE_PROJECT = "emerald-agility-509115-k6"


# --------------------------------
# NASA POWER
# --------------------------------

@app.route("/api/nasa/power", methods=["POST"])
def nasa_power():

    try:
        data = request.get_json() or {}

        lat = float(data["lat"])
        lon = float(data["lng"])

        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            return jsonify({"error": "Invalid coordinates"}), 400

        end_date = date.today() - timedelta(days=7)
        start_date = end_date - timedelta(days=29)

        params = {
            "parameters": "T2M,RH2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN",
            "community": "AG",
            "longitude": lon,
            "latitude": lat,
            "start": start_date.strftime("%Y%m%d"),
            "end": end_date.strftime("%Y%m%d"),
            "format": "JSON",
            "time-standard": "UTC"
        }

        response = requests.get(
            NASA_POWER_URL,
            params=params,
            timeout=60
        )

        response.raise_for_status()
        result = response.json()

        parameters = result["properties"]["parameter"]

        def valid_values(parameter):
            return [
                float(value)
                for value in parameters[parameter].values()
                if value is not None and float(value) > -900
            ]

        def average(parameter):
            values = valid_values(parameter)

            if not values:
                return None

            return round(sum(values) / len(values), 2)

        rainfall_values = valid_values("PRECTOTCORR")

        rainfall = (
            round(sum(rainfall_values), 2)
            if rainfall_values else None
        )

        return jsonify({
            "temperature": average("T2M"),
            "humidity": average("RH2M"),
            "rainfall": rainfall,
            "solar": average("ALLSKY_SFC_SW_DWN"),
            "soilMoisture": None,
            "ph": None,
            "source": "NASA POWER",
            "period": {
                "start": str(start_date),
                "end": str(end_date)
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --------------------------------
# NASA MODIS NDVI
# --------------------------------

@app.route("/api/nasa/modis-ndvi", methods=["POST"])
def modis_ndvi():

    try:
        data = request.get_json() or {}

        lat = float(data["lat"])
        lon = float(data["lng"])

        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            return jsonify({"error": "Invalid coordinates"}), 400

        # Initialize Google Earth Engine
        ee.Initialize(project=GEE_PROJECT)

        # Select a 60-day observation window
        end_date = date.today() + timedelta(days=1)
        start_date = end_date - timedelta(days=60)

        # Create a 5 km area around the selected location
        point = ee.Geometry.Point([lon, lat])
        area = point.buffer(5000)

        # Load NASA MODIS vegetation index data
        collection = (
            ee.ImageCollection("MODIS/061/MOD13Q1")
            .filterBounds(area)
            .filterDate(
                start_date.strftime("%Y-%m-%d"),
                end_date.strftime("%Y-%m-%d")
            )
        )

        image_count = collection.size().getInfo()

        if image_count == 0:
            return jsonify({
                "ndvi": None,
                "imageCount": 0,
                "source": "NASA MODIS MOD13Q1.061",
                "message": "No MODIS images available for this period."
            })

        # Keep only good-quality pixels
        def mask_quality(image):
            good_quality = image.select("SummaryQA").eq(0)

            return (
                image.select("NDVI")
                .updateMask(good_quality)
                .multiply(0.0001)
            )

        ndvi_collection = collection.map(mask_quality)

        # Calculate average NDVI
        mean_ndvi = ndvi_collection.mean()

        result = mean_ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=area,
            scale=250,
            maxPixels=1e9
        ).getInfo()

        ndvi_value = result.get("NDVI")

        # Get latest MODIS observation date
        latest_image = ee.Image(
            collection.sort("system:time_start", False).first()
        )

        latest_date = ee.Date(
            latest_image.get("system:time_start")
        ).format("YYYY-MM-dd").getInfo()

        return jsonify({
            "ndvi": round(ndvi_value, 4) if ndvi_value is not None else None,
            "imageCount": image_count,
            "latestObservation": latest_date,
            "source": "NASA MODIS MOD13Q1.061",
            "resolution": "250 meters",
            "area": "5 km radius",
            "period": {
                "start": str(start_date),
                "end": str(end_date - timedelta(days=1))
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --------------------------------
# NASA SMAP SOIL MOISTURE
# --------------------------------

@app.route("/api/nasa/smap-soil-moisture", methods=["POST"])
def smap_soil_moisture():

    try:
        data = request.get_json() or {}

        lat = float(data["lat"])
        lon = float(data["lng"])

        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            return jsonify({"error": "Invalid coordinates"}), 400

        # Initialize Google Earth Engine
        ee.Initialize(project=GEE_PROJECT)

        # Select the latest 30-day period
        end_date = date.today() + timedelta(days=1)
        start_date = end_date - timedelta(days=30)

        # Selected location
        point = ee.Geometry.Point([lon, lat])

        # Load NASA SMAP L4 dataset
        collection = (
            ee.ImageCollection("NASA/SMAP/SPL4SMGP/008")
            .filterBounds(point)
            .filterDate(
                start_date.strftime("%Y-%m-%d"),
                end_date.strftime("%Y-%m-%d")
            )
            .select([
                "sm_surface",
                "sm_rootzone"
            ])
        )

        image_count = collection.size().getInfo()

        if image_count == 0:
            return jsonify({
                "surfaceSoilMoisture": None,
                "rootZoneSoilMoisture": None,
                "imageCount": 0,
                "source": "NASA SMAP SPL4SMGP.008",
                "message": "No SMAP images available for this period."
            })

        # Calculate average soil moisture
        mean_image = collection.mean()

        # Extract values at the selected location
        result = mean_image.reduceRegion(
            reducer=ee.Reducer.first(),
            geometry=point,
            scale=11000,
            maxPixels=1e6
        ).getInfo()

        surface_moisture = result.get("sm_surface")
        rootzone_moisture = result.get("sm_rootzone")

        # Get latest available observation date
        latest_image = ee.Image(
            collection.sort("system:time_start", False).first()
        )

        latest_date = ee.Date(
            latest_image.get("system:time_start")
        ).format("YYYY-MM-dd HH:mm").getInfo()

        return jsonify({
            "surfaceSoilMoisture": (
                round(surface_moisture, 4)
                if surface_moisture is not None else None
            ),

            "rootZoneSoilMoisture": (
                round(rootzone_moisture, 4)
                if rootzone_moisture is not None else None
            ),

            "imageCount": image_count,
            "latestObservation": latest_date,
            "unit": "m3/m3",
            "source": "NASA SMAP SPL4SMGP.008",
            "resolution": "Approximately 11 km",
            "temporalResolution": "3 hours",

            "period": {
                "start": str(start_date),
                "end": str(end_date - timedelta(days=1))
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --------------------------------
# RUN FLASK SERVER
# --------------------------------

if __name__ == "__main__":
    app.run(debug=True, port=8000)

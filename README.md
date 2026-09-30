# 🌱 CropShield

### Turning NASA Earth-observation data into understandable agricultural insights

**Team AgroCrop · NASA Space Apps Challenge 2026**

📓 [NASA Data Analysis — Google Colab](https://colab.research.google.com/drive/1OVwbFoQMSjKaEV7lPomrAZJI-wOv2XbO?usp=sharing)

**CropShield** is an agricultural decision-support platform developed by **Team AgroCrop**. It combines NASA Earth-observation data, environmental indicators, and an intuitive web interface to help users make more informed crop decisions and understand potential crop stress.

The platform is designed to turn complex environmental information into simple, understandable agricultural insights.

> **Note:** CropShield is an early-warning and decision-support tool. It focuses on environmental stress indicated by satellite-derived signals and is not intended to provide definitive disease or pest diagnoses.

---

## 🚜 The Problem

Agricultural decisions are strongly affected by environmental conditions such as temperature, rainfall, vegetation condition, and soil moisture.

However, farmers may not always have easy access to this information in a form that can support everyday crop decisions.

Important questions include:

* Which crop may be suitable for a particular location?
* What are the current environmental conditions?
* Is a crop showing signs of environmental stress?
* Could low rainfall or soil moisture be affecting crop condition?
* What factors should be considered before making a crop decision?

CropShield aims to bring these different environmental signals together in a simple and accessible platform.

---

## 💡 Our Solution

CropShield provides two main agricultural decision-support features.

### 🌾 Which Crop is Good for My Soil?

Users can select a location and provide information about soil and farming conditions. The system is designed to combine these inputs with environmental data to provide crop suitability insights and explain the factors behind the recommendation.

### 🌿 Crop Health Check

Users can select their location and current crop, describe observed problems, and provide information about soil conditions.

The system is designed to use environmental information to provide crop-health insights and suggested actions.

---

## 🖥️ Website

The CropShield web application provides a modern, responsive interface designed around the needs of agricultural users.

### 🔐 Authentication

The website includes an authentication interface with:

* Sign In
* Sign Up
* Email and Password
* Google Login option
* Responsive authentication card

---

## 📊 Main Dashboard

After signing in, users can access the CropShield dashboard.

The dashboard includes:

* CropShield branding
* User profile section
* Navigation
* Feature selection
* Agricultural-focused interface

The two main features are presented as interactive cards:

1. **Which Crop is Good for My Soil?**
2. **Crop Health Check**

---

## 🌾 Feature 1 — Which Crop is Good for My Soil?

This feature follows a multi-step workflow.

### Step 1 — Location Selection

Users can select an agricultural location using a map/location interface.

The interface supports:

* Location search
* Map interaction
* Region selection
* Latitude and longitude information

For example, users can select an agricultural area around **Mymensingh, Bangladesh**.

### Step 2 — Soil & Environmental Information

Users can provide information such as:

**Soil Type**

* Loamy
* Clay
* Sandy
* Silt

**Crop History**

Users can enter previous crops grown on the land.

**Previous Fertilizers/Chemicals**

Users can select previously used fertilizers or chemicals.

**Irrigation Source**

* Rain-fed
* Groundwater
* Canal

**Seasonal & Weather Context**

Users can provide additional information about the current agricultural conditions.

### Step 3 — Crop Recommendation

The recommendation interface is designed to present:

* Top recommended crops
* Suitability scores
* Environmental factors
* Reasons behind the recommendation

Instead of showing only a result, CropShield aims to explain **why** a crop may be suitable.

For example:

> **High Suitability**
>
> Favorable conditions were observed based on moisture, vegetation, rainfall, and temperature-related indicators.

---

## 🌿 Feature 2 — Crop Health Check

The Crop Health Check feature provides a separate workflow for evaluating an existing crop.

### Step 1 — Location & Crop Selection

Users can provide:

* Location
* Latitude/longitude
* Current crop name

### Step 2 — Issue Description

Users can describe problems they are observing in their crop.

Examples include:

* Unusual leaf appearance
* Possible pest problems
* Crop growth concerns
* Environmental stress
* General crop-health concerns

Users can also provide their current soil condition:

* Over-watered
* Dry
* Normal

> CropShield does not claim to diagnose diseases or pests from these observations.

### Step 3 — Stress Insight & Suggested Actions

The interface is designed to provide:

* Possible environmental stress factors
* Environmental factors associated with the problem
* Suggested action steps
* Soil-management considerations
* Crop-care recommendations

The goal is to provide understandable information rather than simply displaying raw environmental data.

---

## 🛰️ NASA Earth-Observation Data

NASA Earth-observation data is an important part of the CropShield system.

Different NASA datasets provide different environmental signals that can be used to understand agricultural conditions.

### 🌡️ NASA ECOSTRESS

ECOSTRESS provides information related to land-surface temperature, evapotranspiration, and plant water stress.

**CropShield can use ECOSTRESS-related information for:**

* Thermal stress indicators
* Evaporative stress
* Water-stress-related analysis
* Crop condition assessment

**Current status:** Planned integration.

### 🌿 NASA MODIS

MODIS provides satellite observations that can be used to monitor vegetation conditions.

CropShield uses vegetation indicators such as **NDVI** to help understand vegetation condition and changes over time.

**CropShield can use MODIS for:**

* NDVI-based vegetation monitoring
* Crop growth assessment
* Vegetation condition analysis
* Detecting changes in crop condition

**Current status:** Analyzed in Google Colab.

### 💧 NASA SMAP

The **Soil Moisture Active Passive (SMAP)** mission provides soil-moisture observations.

**CropShield can use SMAP for:**

* Soil-moisture monitoring
* Moisture-related crop stress analysis
* Environmental condition assessment
* Supporting agricultural decision-making

**Current status:** Analyzed in Google Colab.

### 🌧️ NASA GPM IMERG

NASA's **Global Precipitation Measurement (GPM)** mission provides precipitation observations through products such as IMERG.

**CropShield can use GPM IMERG for:**

* Rainfall monitoring
* Recent precipitation conditions
* Understanding water availability
* Supporting crop-stress analysis

**Current status:** Planned integration.

---

## 🧩 NASA Data → Agricultural Insight

CropShield brings different environmental signals together rather than relying on a single data source.

```text
Location
   ↓
NASA Earth-Observation Data
   ↓
Environmental Indicators
   ↓
Data Processing
   ↓
AI-Assisted Interpretation
   ↓
Agricultural Insight
```

The goal is to make satellite-derived environmental information easier to understand and use.

---

## 🧠 Explainable Insights

CropShield is designed to provide explanations along with its results.

For example:

```text
Crop Stress: HIGH

Possible contributing factors:

• Elevated thermal stress
• Reduced soil moisture
• Low recent rainfall

Interpretation:

The combination of environmental indicators
suggests that the crop may be experiencing
water-related environmental stress.
```

This approach helps users understand **what the system is seeing and why it matters**, rather than receiving only a single label.

---

## 📓 NASA Data Analysis — Google Colab

NASA data analysis and visualization for the CropShield project is explored using Google Colab.

### 🔗 NASA Data Analysis Notebook

[Open the Google Colab Notebook](https://colab.research.google.com/drive/1OVwbFoQMSjKaEV7lPomrAZJI-wOv2XbO?usp=sharing)

The notebook contains analysis and visualization of NASA datasets used during the development of the CropShield prototype.

Current analysis includes:

* NASA MODIS NDVI
* NASA SMAP soil moisture

Additional NASA datasets can be integrated into the analysis pipeline as development continues.

---

## 🛠️ Technology Stack

### Frontend

* React
* Tailwind CSS
* Lucide Icons
* Responsive/mobile-friendly design
* Interactive multi-step forms

### Maps

* Leaflet / map-compatible architecture
* Location selection
* Latitude and longitude information

### Backend / API Architecture

The frontend is structured to connect with a backend service such as:

* Python
* Flask
* FastAPI

The backend can be used to process environmental information and connect the frontend with NASA data services.

---

## 🔄 API-Ready Architecture

The application is designed with helper functions and modular components so that external data services can be connected to the interface.

```text
Frontend
   ↓
Backend API
   ↓
NASA Data / Processing Layer
   ↓
Environmental Indicators
   ↓
AI Interpretation
   ↓
CropShield Interface
```

Some API-related components may currently be implemented as prototype or placeholder functionality while development continues.

---

## 🚧 Current Development Status

CropShield is currently being developed as a prototype for the **NASA Space Apps Challenge 2026**.

### Currently implemented

* Responsive web interface
* Authentication interface
* Dashboard
* Location/map selection
* Crop suitability workflow
* Crop Health Check workflow
* Environmental insight interface
* MODIS NDVI analysis
* SMAP soil-moisture analysis
* Google Colab data visualization

### In development / planned

* Live NASA data integration
* ECOSTRESS integration
* GPM IMERG integration
* Backend/API connection
* Automated location-based analysis
* Improved environmental stress detection
* More detailed crop suitability logic

---

## 🌍 Future Development

Future development may include:

* More NASA Earth-observation datasets
* Automated location-based environmental analysis
* More detailed crop suitability analysis
* Improved crop-stress detection
* Time-series monitoring
* Additional agricultural indicators
* More localized recommendations
* Improved AI-assisted explanations
* Live backend and NASA API integration

---

## 🎯 Project Vision

CropShield aims to make Earth-observation information more understandable and useful for agricultural decision-making.

Instead of requiring users to interpret complex satellite datasets themselves, CropShield focuses on transforming environmental signals into simple, meaningful agricultural insights.

### From NASA Data → To Environmental Understanding → To Smarter Crop Decisions

---

## 👥 Team AgroCrop

**Team AgroCrop** is a team of five CSE students participating in the **NASA Space Apps Challenge 2026**.

We are interested in technology, AI, data, software development, and solving real-world problems through practical solutions.

**Team:** AgroCrop

**Project:** CropShield

**Event:** NASA Space Apps Challenge 2026

---

## 🛰️ NASA Space Apps Challenge 2026

**Project:** CropShield
**Team:** AgroCrop
**Challenge:** NASA Space Apps Challenge 2026

> **Turning NASA Earth-observation data into understandable agricultural insights.**

---

## 💻 Development

```bash
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

---

## 📌 Note

CropShield is a prototype developed for the NASA Space Apps Challenge 2026. Recommendations and insights are intended as decision-support information and should not replace professional agricultural advice or on-site assessment.

# 🧬 Chronic Kidney Disease (CKD) Using Ml

An end-to-end, clinical-grade decision support platform designed to predict, track, and explain Chronic Kidney Disease (CKD) Stage Prediction using Machine Learning.

---

## 🚀 Project Overview

The **CKD Using ML Platform** is a multi-tier, responsive clinical dashboard system tailored for **Patients**, **Doctors**, and **Administrators**. It integrates a **Spring Boot** backend, an interactive **React** frontend (utilizing Tailwind CSS and Recharts), and a dedicated **FastAPI** Machine Learning service that utilizes a Machine Learning model (Random Forest Classifier) for staging, CKD risk estimation, and SHAP (Shapley Additive exPlanations) for explainable predictions.

---

## 🏗️ High-Level Architecture

The platform uses a microservices-style layout:

1. **Frontend (React)**: An interactive SPA built with React and Tailwind CSS, featuring role-based portals for Patients, Doctors, and Admins.
2. **Backend (Spring Boot)**: A Java-based RESTful API handling authentication (JWT), database operations (MySQL), business logic (including GFR calculation and PDF report generation), and chatbot mode routing.
3. **ML Service (FastAPI)**: A Python service providing inference, SHAP calculations, and continuous model retraining.

```mermaid
graph TD
    User([User: Admin / Doctor / Patient]) -->|Interacts| ReactApp[React Frontend - Port 3000]
    ReactApp -->|HTTP / JWT Auth| SpringBoot[Spring Boot Backend - Port 8080]
    SpringBoot -->|SQL Queries| MySQL[(MySQL Database - Port 3306)]
    SpringBoot -->|HTTP Requests| FastAPI[FastAPI ML Engine - Port 8000]
    FastAPI -->|Load/Save Artifacts| MLModel[ML Model / SHAP Explainer]
```

---

## 🌟 Core Features & Portals

### 1. Portals & Roles
*   **Patient Portal**: 
    *   **Lab Measurement Logging**: Input clinical test details (including age, blood pressure, specific gravity, albumin, sugar, creatinine, hemoglobin, etc.).
    *   **AI Diagnostics & Predictions**: Instantly check CKD stage (Stage 1 to 5), risk score %, and confidence rate.
    *   **PDF Report Generation**: Download clinical-grade lab report PDFs containing test results with reference ranges and automatic abnormal value highlighting.
    *   **Historical progression logs**: Track test records chronologically over time.
    *   **AI Chatbot Assistant**: Ask questions about potassium, sodium diets, symptoms, and test reports.
*   **Doctor Portal**: 
    *   **Patient Directory Management**: Track assigned patients, view profiles, and update laboratory logs.
    *   **Explainable AI (XAI) Dashboard**: View feature attribution (SHAP explanation) charts showing *why* the AI estimated a specific CKD risk level, listing the positive or negative contribution of each factor (such as Serum Creatinine, Hemoglobin, Blood Pressure, and Age).
    *   **Direct Messaging**: Secure chat logs to message patients directly.
*   **Admin Portal**: 
    *   **User Account Actions**: Manage user registrations, profile records, and assign security roles.
    *   **Audit Logging Viewer**: Monitor user actions and application security logs.
    *   **ML Dashboard**: Trigger asynchronous model retraining and view model metrics adjustments (Accuracy, Precision, Recall, F1-Score).

### 2. Dual-Mode Clinical Chatbot
*   **Patient Mode**: Focused on answering questions in layman's terms regarding dietary restrictions (potassium/sodium limits), symptoms (proteinuria/edema), and test report markers (eGFR/ACR).
*   **Doctor Mode**: Explains the mathematical concepts behind MLP layers, SHAP calculations, KDIGO staging guidelines, and clinical reference materials.

---

## ⚙️ Machine Learning Pipeline & Explainability

### 1. Model Configuration
The ML classifier is trained using a **Random Forest Classifier** optimized through hyperparameter tuning with `GridSearchCV` on a 24-feature dataset:
*   **Continuous Features (14)**: Age, Blood Pressure, Specific Gravity, Albumin, Sugar, Blood Glucose Random, Blood Urea, Serum Creatinine, Sodium, Potassium, Hemoglobin, Packed Cell Volume, White Blood Cell Count, Red Blood Cell Count.
*   **Categorical Features (10)**: Red Blood Cells, Pus Cell, Pus Cell Clumps, Bacteria, Hypertension, Diabetes Mellitus, Coronary Artery Disease, Appetite, Peda Edema, Anemia.

### 2. Preprocessing & Artifacts
The training pipeline (`train_model.py`) pre-processes features by:
1.  Encoding categorical inputs with `LabelEncoder`.
2.  Scaling continuous inputs with `StandardScaler`.
3.  Generating a SHAP explainer (`shap.KernelExplainer`) using subset training samples.
4.  Exporting artifacts (`ckd_model_v1.pkl` and `shap_explainer.pkl`) to the model directory.

### 3. Continuous Learning (Retraining)
Whenever a patient inputs a new lab measurement, the Spring Boot backend automatically appends the record to the CSV file at `ml/data/ckd_initial_data.csv`. Admins can trigger the `/retrain` FastAPI endpoint, which launches a background task (`perform_retraining`) to run the training script, compute updated metrics, and hot-reload the pickle model artifacts.

---

## 🔗 System API Specification

### Machine Learning API (FastAPI - Port 8000)
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/predict` | `POST` | Accepts a 24-feature patient record and returns predicted CKD stage, risk score %, confidence, and warning status. |
| `/explain` | `GET` | Computes and returns SHAP value contributions for Serum Creatinine, Hemoglobin, Blood Pressure, Age, and other features. |
| `/retrain` | `POST` | Asynchronously executes the model retraining pipeline in a background thread. |

### Spring Boot Backend API (Port 8080)
| Endpoint Prefix | Description |
| :--- | :--- |
| `/api/auth/*` | Handles registration, logins, JWT issues, and password reset validations. |
| `/api/patients/*` | Used to log/view clinical records, check historical GFR progression, and download PDF lab reports. |
| `/api/doctors/*` | Patient lists, profile management, clinical overrides, and SHAP calculations. |
| `/api/admin/*` | Auditing log viewer, user management, and triggering model retraining. |
| `/api/chatbot/*` | Dual-mode clinical chatbot logic and doctor-patient messaging. |

---

## 🛠️ Technology Stack

*   **Frontend**: React, Tailwind CSS, Recharts / Chart.js, Lucide React, Axios.
*   **Backend**: Java 17, Spring Boot 3.x, Spring Security (JWT), Hibernate / Spring Data JPA, Apache PDFBox, Maven.
*   **Machine Learning**: Python 3.10+, FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy, SHAP, Pydantic.
*   **Database**: MySQL.

---

## 📂 Project Directory Structure

```
CKD/
├── frontend/                # React Web Application
│   ├── public/              # Static HTML template & assets
│   └── src/                 # React component, hook, and page assets
│       ├── components/      # Common UI Elements & layouts
│       ├── pages/           # Portals (Patient, Doctor, Admin, Auth)
│       └── services/        # Backend API integration clients
├── backend/                 # Spring Boot REST API
│   ├── pom.xml              # Maven dependencies build configuration
│   └── src/main/            # Java application sources
│       ├── java/com/ckd/ai/ # Security, controllers, services, database models
│       └── resources/       # Seeding files, app configs, SQL migrations
└── ml/                      # FastAPI Machine Learning Service
    ├── data/                # Dataset CSV files (Initial, Chatbot DB)
    ├── training/            # ML model training and evaluation scripts
    ├── models/              # Saved model pickles (ckd_model_v1.pkl, shap_explainer.pkl)
    ├── inference/           # FastAPI application definition and endpoints
    └── main.py              # ML FastAPI startup entry point
```

---

## ⚙️ Getting Started & Setup

### 1. Prerequisites
*   **Java**: JDK 17
*   **Node.js**: v16+ & npm
*   **Python**: v3.10+
*   **Database**: MySQL Server 8.0+

### 2. Setup Machine Learning Service (`ml`)
1.  Navigate to the `ml/` directory.
2.  Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the FastAPI server:
    ```bash
    python main.py
    ```
    *The ML server runs on `http://127.0.0.1:8000`.*

### 3. Setup Backend (`backend`)
1.  Ensure MySQL is running and create the `ckd_db` database if not generated:
    ```sql
    CREATE DATABASE ckd_db;
    ```
2.  Navigate to the `backend/` directory.
3.  Update the database connection details in `src/main/resources/application.yml` (port, username, and password).
4.  Build and run the application using Maven:
    ```bash
    mvn clean spring-boot:run
    ```
    *The Spring Boot server runs on `http://localhost:8080`.*

### 4. Setup Frontend (`frontend`)
1.  Navigate to the `frontend/` directory.
2.  Install required packages:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
    *The React application will launch at `http://localhost:3000`.*

---

## 🔑 Seed User Accounts

Upon startup, the Spring Boot application automatically bootstraps system credentials if they do not exist:

| Role | Username | Password | Authority Role |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | `ROLE_ADMIN` |
| **Doctor** | `doctor` | `doctor123` | `ROLE_DOCTOR` |
| **Demo User** | `demo` | `demo123` | `ROLE_PATIENT` |
| **Patients** (seeded) | `patient_0`, `patient_1` | `password123` | `ROLE_PATIENT` |

---

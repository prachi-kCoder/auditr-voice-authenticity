
# Auditr: Deepfake Voice Forensics 🔍🎙️
## Project info
<img width="1819" height="855" alt="image" src="https://github.com/user-attachments/assets/406e24fd-9111-4b3a-b84b-582bedfc6fb6" />


## Overview
Auditr is a **multi‑model forensic platform** designed to differentiate between authentic human speech and AI‑generated deepfake audio. Built for **financial security, compliance, and trust**, it provides real‑time screening, forensic audit trails, and explainable AI (XAI) visualizations.

## Features
- 🎯 **Deepfake Detection**: CNN‑LSTM pipeline achieving **95.2% accuracy** on benchmark datasets (LibriSpeech, ASVspoof).
- ⚡ **Real‑Time Screening API**: FastAPI backend delivering liveness checks in **<1 second**.
- 📊 **Explainable Forensics (XAI)**: SHAP/LIME‑based visualizations for transparent decision‑making.
- 🔄 **Scalable Processing**: Asynchronous ML workload orchestration with **Celery + Redis**.
- 🔐 **Authentication & Security**: JWT‑based user management with audit logging.
- 🗄️ **Database Integration**: PostgreSQL for structured forensic metadata; extensible for cloud storage.
- 🌐 **Frontend**: React.js dashboard for interactive reports and monitoring.

## Tech Stack
- **Backend**: FastAPI, Celery, Redis, PostgreSQL  
- **Frontend**: React.js, TailwindCSS  
- **ML Models**: CNN, LSTM, HuggingFace anti‑spoof models  
- **DevOps**: Docker, Kubernetes, GitHub Actions CI/CD  
- **Cloud**: AWS (Cloud Practitioner Essentials certified)

## Architecture
```text
Frontend (React.js) → REST API (FastAPI) → ML Engine (CNN/LSTM) → 
Async Queue (Celery/Redis) → Database (PostgreSQL) → XAI Reports



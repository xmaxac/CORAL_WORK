# 🌊 CoralBase – A Platform for Stony Coral Tissue Loss Disease Research  

### [🔗 View the CoralBase Research Portfolio](https://osceolak12-my.sharepoint.com/:w:/g/personal/5047528_student_osceolaschools_net/EaL1SjSILYNHthF8On6rpFUB0c033oUMq2zt3x2KnnJYdA?e=dK1LMb)

---

## Table of Contents
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Features](#-features)
  - [AI-Powered Disease Detection](#-ai-powered-disease-detection)
  - [Interactive Reporting & Visualization](#-interactive-reporting--visualization)
  - [AI Chatbot Assistant](#-ai-chatbot-assistant)
  - [Report Groups (Subreddit-Style)](#-report-groups-subreddit-style)
  - [Report Review & Moderation](#-report-review--moderation)
  - [User-to-User Chat](#-user-to-user-chat)
  - [Security Enhancements](#-security-enhancements)
- [Tech Stack](#-tech-stack)
- [AI Model Overview](#-ai-model-overview)
- [Installation & Setup](#-installation--setup)
- [Summary](#-summary)

---

## Overview  
CoralBase is an open-source web platform that helps researchers, conservationists, and marine biologists track, analyze, and combat **Stony Coral Tissue Loss Disease (SCTLD)**. It combines **AI-based detection**, **crowdsourced reporting**, **real-time mapping**, and **research collaboration tools** to streamline coral disease research and response.

Unlike static databases, CoralBase actively verifies reports using AI, supports multimedia, enables community moderation, and provides meaningful data insights.

---

## Problem Statement  
SCTLD is one of the most aggressive and fast-spreading threats to coral reefs across the Caribbean and Western Atlantic. Despite the ecological importance of coral reefs, **accurate disease tracking and data sharing remain fragmented and outdated**.

### CoralBase directly addresses this by:
- Offering an **AI-enhanced disease reporting system**.
- Providing **real-time, geospatial visualizations**.
- Encouraging **community science and collaboration**.
- Supporting **verified data collection and researcher feedback**.

---

## Features  

### AI-Powered Disease Detection  
- Uses **YOLOv8** for fast, accurate detection of SCTLD in uploaded coral **images and videos**.  
- Supports **batch image analysis** with real-time confidence scoring.  
- Submitted photos are **auto-verified before report submission**.  
- Bounding boxes identify infected areas with high precision.  

---

### Interactive Reporting & Visualization  
- Submit **geotagged reports** with images, videos, and documents.  
- View SCTLD spread via **interactive maps**, and **heatmaps**.  
- Filter data by **location**.  
- Includes graphs for recent activity, report count by country, and more.

---

### AI Chatbot Assistant  
- Powered by OpenAI GPT models.  
- Sources answers **only from verified CoralBase data**.  
- Helps users explore research, understand trends, and get guidance.  
- Fully integrated into the user dashboard for instant support.

---

### Report Groups (Subreddit-Style)  
- Users can join or create **groups based on region, topic, or research focus**.  
- Each group has a **dedicated report feed**, discussions, and moderation.  
- Encourages focused collaboration while staying part of the wider network.

---

### Report Review & Moderation  
- Researchers can **approve, or deny** reports.    
- Community moderation tools include **commenting, voting, and flagging**.  
- Designed to keep the dataset **clean, trustworthy, and scientifically usable**.

---

### User-to-User Chat  
- Users can **privately message** others within the platform.  
- Includes **typing indicators, read receipts**, and **rate limiting**.  
- Useful for **collaborative research**, verification discussions, or organizing dives.

---

### Security Enhancements  
- Enforced **Content Security Policy (CSP)**.  
- **API rate limiting** across endpoints to prevent abuse.  
- Uses **JWT-based auth** with full role separation between users, researchers, and admins.  
- Secure AWS S3 media storage with limited-access keys.

---

## Tech Stack  

| **Component**      | **Technology** |
|--------------------|----------------|
| **Frontend**       | React, Tailwind CSS |
| **Backend**        | Node.js, Express |
| **Database**       | PostgreSQL (AWS RDS) |
| **Storage**        | AWS S3 (images, videos, docs) |
| **AI/ML**          | YOLOv8 (PyTorch) |
| **Deployment**     | Docker, **AWS Lightsail** (Backend), AWS S3 + CloudFront (Frontend) |

---

## AI Model Overview  

| Task                    | Model    | Metric         |
|-------------------------|----------|----------------|
| Coral Detection         | YOLOv8   | 92% mAP@0.5    |
| SCTLD Classification    | YOLOv8   | 94% Precision  |

> YOLOv8 is now the only detection model used for better speed and accuracy.

---

## Installation & Setup  

To run CoralBase locally:

### 1️⃣ Clone the Repository 
```bash
git clone https://github.com/xmaxc/TSA_SOFTWARE_DEVELOPMENT_CORAL.git
cd TSA_SOFTWARE_DEVELOPMENT_CORAL
```

### 2️⃣ Set Up Environment Variables
Create a .env file in both /frontend and /backend and fill in the following:
- AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- DATABASE_URL (PostgreSQL connection string)
- OPENAI_API_KEY (for AI chatbot access)
- JWT_SECRET (used for user authentication)
- etc

### 3️⃣ Start Backend
```bash
cd backend
npm install
npm run dev
```

### 4️⃣ Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Access Locally
[localhost](http://localhost:5173)

### Access Online
[CoralBase](coralbase.net)
> Account required for full feature access (report creation, AI tools, chat system, group discussions, etc.)


# 🌊 CoralBase – A Platform for Stony Coral Tissue Loss Disease Research  
### [Click here to view the CoralBase Research Portfolio!](https://osceolak12-my.sharepoint.com/:w:/g/personal/5047528_student_osceolaschools_net/EaL1SjSILYNHthF8On6rpFUB0c033oUMq2zt3x2KnnJYdA?e=dK1LMb)
## Overview  
CoralBase is an open-source web platform that helps researchers, conservationists, and marine biologists track, analyze, and combat Stony Coral Tissue Loss Disease (SCTLD). Using AI-powered image recognition, crowdsourced data, and interactive visualizations, CoralBase enables better detection and understanding of coral diseases.  

## Problem Statement  
Coral reefs are one of the most important ecosystems on the planet, supporting 25% of marine life, protecting coastal areas, and contributing to global biodiversity. However, SCTLD has been devastating reefs, spreading across the Caribbean and beyond. Despite its severity, tracking SCTLD remains a major challenge due to limited data-sharing platforms and real-time analysis tools.

### **CoralBase solves this by:**  
✅ Providing a centralized research hub for SCTLD studies.  
✅ Automating disease identification using AI-powered image and video recognition.  
✅ Enabling data-driven conservation efforts through interactive visualizations.  
✅ Fostering collaboration among marine researchers worldwide.  

## 🚀 Features  
### AI-Powered Disease Detection
- Uses computer vision to analyze uploaded coral images/videos and detect signs of SCTLD.  
- Provides confidence scores and highlights affected areas.  

### **Research Database**  
- Allows researchers to upload and search reports. 

### **Interactive Disease Maps**  
- Displays real-time coral disease spread using geotagged data.  
- Allows users to visualize locations of reports saved within the databse.  

### **Graphs & Analytics**  
- Generates visual reports on number of reports per country, and recent reports.  

### **Community Collaboration**  
- Researchers can discuss findings, comment on studies, and share insights.
- Encourages crowdsourced data collection from divers, marine biologists, and conservationists.  

## 🏗 Tech Stack  
| **Component**      | **Technology** |
|--------------------|---------------|
| **Frontend**      | React, Tailwind CSS |
| **Backend**       | Node.js, Express |
| **Database**      | PostgreSQL (AWS RDS) |
| **Caching**       | Redis (AWS ElastiCache) |
| **Storage**       | AWS S3 (for image & document uploads) |
| **AI/ML**        | TensorFlow, Ultralytics (YOLOv8), OpenCV|
| **Deployment**    | Docker, AWS ECS, AWS S3 + Cloudfront |

## Installation & Setup  
To run CoralBase locally:  

### 1️⃣ Clone the Repository 
```bash
git clone https://github.com/xmaxc/TSA_SOFTWARE_DEVELOPMENT_CORAL.git
```

### 2️⃣ Set Up Environment Variables
Create a .env file in the root directory and add the necessary AWS, database, and API keys.

### 3️⃣ Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Now visit: http://localhost:5173 OR
To access online: https://coralbase.net (make an account first to access all features)!

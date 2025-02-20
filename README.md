# 🌊 CoralBase – Atony Coral Tissue Loss Disease Research  

## 📌 Overview  
**CoralBase** is an open-source web platform that helps researchers, conservationists, and marine biologists **track, analyze, and combat Stony Coral Tissue Loss Disease (SCTLD)**. Using **AI-powered image recognition, crowdsourced data, and interactive visualizations**, CoralBase enables better detection and understanding of coral diseases.  

This project was developed for the **TSA Software Development Competition**, addressing the prompt:  
> *Develop a program that enhances the environment and/or agriculture to be more sustainable and efficient.*  

## 🎯 Problem Statement  
Coral reefs are one of the most important ecosystems on the planet, supporting **25% of marine life**, protecting coastal areas, and contributing to global biodiversity. However, SCTLD has been devastating reefs, spreading across the Caribbean and beyond. **Despite its severity, tracking SCTLD remains a major challenge due to limited data-sharing platforms and real-time analysis tools.**  

### 🔥 **CoralBase solves this by:**  
✅ Providing a **centralized research hub** for SCTLD studies.  
✅ Automating **disease identification** using AI-powered image recognition.  
✅ Enabling **data-driven conservation efforts** through interactive visualizations.  
✅ Fostering **collaboration** among marine researchers worldwide.  

## 🚀 Features  
### 🔍 **AI-Powered Disease Detection**  
- Uses **computer vision** to analyze uploaded coral images/videos and detect signs of SCTLD.  
- Provides **confidence scores** and highlights affected areas.  

### 📚 **Research Database**  
- Allows researchers to **upload and search** reports. 

### 🗺 **Interactive Disease Maps**  
- Displays **real-time coral disease spread** using **geotagged data**.  
- Allows users to visualize locations of reports saved within the databse.  

### 📊 **Graphs & Analytics**  
- Generates visual reports on **number of reports per country, and recent reports**.  

### 🌐 **Community Collaboration**  
- Researchers can **discuss findings, comment on studies, and share insights**.  
- Encourages **crowdsourced data collection** from divers, marine biologists, and conservationists.  

## 🏗 Tech Stack  
| **Component**      | **Technology** |
|--------------------|---------------|
| **Frontend**      | React, Tailwind CSS |
| **Backend**       | Node.js, Express |
| **Database**      | PostgreSQL (AWS RDS) |
| **Caching**       | Redis (AWS ElastiCache) |
| **Storage**       | AWS S3 (for image & document uploads) |
| **AI/ML**        | TensorFlow.js (for coral disease image recognition) |
| **Deployment**    | Docker, AWS ECS, AWS S3 + Cloudfront |

## 📂 Installation & Setup  
To run CoralBase locally:  

### **1️⃣ Clone the Repository**  
```bash
git clone https://github.com/xmaxc/TSA_SOFTWARE_DEVELOPMENT_CORAL.git
```

### **2️⃣ Set Up Environment Variables**
Create a .env file in the root directory and add the necessary AWS, database, and API keys.

### **3️⃣ Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

✅ Now visit: http://localhost:5173 🚀

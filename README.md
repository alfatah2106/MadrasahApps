# Madrasah App - Integrated Digital Learning Platform 🎓

A comprehensive, modern web application designed to digitalize school activities and enhance the learning experience. Built with React, TypeScript, and Tailwind CSS, this application leverages Google Workspace (Google Apps Script, Google Sheets, and Google Drive) as a powerful, serverless backend.

This project demonstrates my ability to build full-stack, scalable applications integrating third-party APIs, OAuth authentication, and serverless architectures.

## ✨ Key Features

*   🔐 **Secure Authentication**
    *   Seamless Google Login (OAuth 2.0) integration.
    *   Custom student data collection (NIS/Student ID and Class).
    *   Persistent sessions using `localStorage`.
*   📚 **Digital Library (Perpustakaan)**
    *   Browse and read educational materials and e-books.
    *   Data dynamically fetched from Google Sheets via Google Apps Script (GAS).
*   🎬 **Media Learning (Iska Tube)**
    *   Curated educational video platform.
    *   Categorized content (Video, Audio, Podcast) with embedded players.
*   📝 **Assignment Management (Tugas)**
    *   Create, edit, and submit assignments directly within the app.
    *   Deep integration with Google Drive API to automatically generate Google Docs, Sheets, and Slides.
    *   Real-time status tracking (Pending, Submitted, Completed).
*   🎨 **Collaborative Whiteboard (Papan Tulis)**
    *   Interactive canvas powered by Excalidraw.
    *   **Teacher Mode**: Students can connect to a live teacher's board using a room link.
    *   **Student Mode**: Personal workspace that can be shared with peers for real-time collaboration.
*   🤖 **AI Learning Assistant (Tanya Gemini)**
    *   Integrated Google Gemini AI to help students answer questions and understand complex topics.

## 🛠️ Tech Stack

**Frontend:**
*   React 18
*   TypeScript
*   Tailwind CSS (Styling & Responsive Design)
*   Vite (Build Tool)
*   Lucide React (Icons)

**Backend & Database (Serverless):**
*   Google Apps Script (REST API endpoints)
*   Google Sheets (Database)
*   Google Drive (File Storage & Document Generation)

**Authentication & Integrations:**
*   Google Identity Services (OAuth)
*   Excalidraw (Whiteboard Embed)
*   Google Gemini (AI Assistant)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn
*   Google Cloud Console account (for OAuth Client ID)
*   Google Apps Script deployments (for Library, Media, and Tasks)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/madrasah-app.git
    cd madrasah-app
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Google Apps Script Web App URLs:
    ```env
    VITE_GAS_PERPUSTAKAAN_URL="your_gas_library_url"
    VITE_GAS_MEDIA_URL="your_gas_media_url"
    VITE_GAS_TUGAS_URL="your_gas_tasks_url"
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 🏗️ Architecture Overview

This application uses a unique **Serverless Architecture** utilizing Google Workspace:
1.  **Frontend**: React app hosted on any static hosting (Vercel, Netlify, Cloud Run).
2.  **API Layer**: Google Apps Script (`doGet` and `doPost` functions) acts as the REST API.
3.  **Database**: Google Sheets acts as a free, easily manageable database for Books, Videos, and Tasks.
4.  **Storage**: Google Drive is used to store and serve documents created by students.

## 👨‍💻 Author

**[Your Name]**
*   Portfolio: [Your Portfolio URL]
*   LinkedIn: [Your LinkedIn URL]
*   GitHub: [Your GitHub URL]

---
*This project was built to showcase modern frontend development skills combined with creative serverless backend solutions.*

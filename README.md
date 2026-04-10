# 🎙️ UnMute - AI English Communication Platform

**An AI-powered communication practice platform designed to help students, professionals, and language learners prepare for interviews, group discussions, and real-world conversations.**

---

## 🚀 Our Journey: From an Empty Folder to Production

Building **UnMute** was an iterative, full-stack engineering journey. Here is exactly how we went from a blank directory to a fully functioning AI platform:

### 1. The Foundation (Empty Folder $\rightarrow$ Servers Booting)
We started by establishing a clean separation of concerns. We bootstrapped a **Spring Boot** application (Java) for our backend API and a **React 18** application for our frontend. For rapid database prototyping without complex infrastructure, we plugged in an in-memory **H2 Database** mapped via **Spring Data JPA/Hibernate**. 

### 2. Securing the Platform
Next, we locked it down. We implemented a robust **Spring Security** configuration with a custom `JwtAuthFilter`. Passwords are encrypted via **BCrypt**, and successful logins generate stateless **JSON Web Tokens (JWT)**. On the frontend, we built `AuthContext.js` to manage the session securely across React routes, while also provisioning a `demo@unmute.app` fallback to allow prospective users to test the platform without registering.

### 3. Capturing Voice & Real-Time Transcription
To tackle speech, we initially experimented with heavy backend audio transcoding. We pivoted towards efficiency by utilizing the browser's native `MediaRecorder` and the HTML5 **Web Speech API (`SpeechRecognition`)**. This allowed us to transcribe spoken words into text *client-side* in real-time, drastically reducing server bandwidth and load times.

### 4. The AI NLP Validation Engine (The Big Pivot)
The core of UnMute is its analysis. We created a centralized `SpeechService` in the Java backend capable of deterministic Natural Language Processing (NLP). 
*   **The Refactor:** Initially, different modules (Practice, Interview, Challenges) were clunkily sending raw `multipart/form-data` audio blobs. We standardized the entire application architecture to transmit hyper-efficient JSON payloads (`{"transcript": "...", "duration": "..."}`). 
*   **The Output:** The engine evaluates transcript length, word density, and filler word frequency to compute rigid 0-100 scores across Fluency, Grammar, Vocabulary, and Confidence. It also returns curated situational feedback.

### 5. Gamification, Dashboards, and UI Polish
We didn't want a boring dashboard. Using **Tailwind CSS 3** and **Recharts**, we constructed a vibrant, glassmorphic interface. We introduced an **Elo-style Rating System (Skill Points)** starting at 1000, XP progression, level caps, consecutive daily activity streaks, and dynamically rotating Daily Challenges to keep users engaged and charting their progress correctly on their chronological X-axis graphs.

---

## 🛠️ Tech Stack

### **Frontend**
*   **Framework:** React 18
*   **Routing:** React Router v6
*   **Styling:** Tailwind CSS 3
*   **State Management:** React Context API (`AuthContext`)
*   **HTTP Client:** Axios
*   **Data Visualization:** Recharts
*   **Voice/Audio:** HTML5 `SpeechRecognition` & `MediaRecorder` APIs

### **Backend**
*   **Framework:** Java 17 + Spring Boot 3.2.3
*   **Data Layer:** Spring Data JPA + Hibernate
*   **Database:** H2 In-Memory Database (JDBC)
*   **Security:** Spring Security 6 + JWT (JSON Web Tokens) + BCrypt
*   **Build Tool:** Maven

---

## ⚙️ How to Run Locally

### 1. Start the Backend (Spring Boot)
Ensure you have Java 17+ and Maven installed.
```bash
cd backend
mvn clean spring-boot:run
```
*The Spring Boot server will bind to `http://localhost:8080`. The H2 database console is available at `/h2-console`.*

### 2. Start the Frontend (React)
Ensure you have Node.js installed.
```bash
cd frontend
npm install
npm start
```
*The application should automatically open in your browser at `http://localhost:3000`.*

> **Network Note:** The frontend's `.env` specifically targets `http://127.0.0.1:8080` to safely bypass strict IPv6 (`::1`) loopback blocking observed on some Windows environments (`ERR_CONNECTION_REFUSED`).

---

## 📄 License
MIT License - Built for learning and demonstration purposes.

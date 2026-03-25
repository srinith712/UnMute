# 🎤 UnMute – Turn Your Voice On

**AI-powered communication practice platform** for students and professionals preparing for interviews, group discussions, and real-world conversations.

---

## 🚀 Quick Start

```bash
cd unmute-frontend
npm install
npm start
```

App opens at **http://localhost:3000**

---

## 📦 Tech Stack

| Layer        | Technology                    |
|--------------|-------------------------------|
| UI Framework | React 18                      |
| Styling      | Tailwind CSS 3                |
| Routing      | React Router 6                |
| HTTP Client  | Axios                         |
| Charts       | Recharts                      |
| Real-time    | WebSocket (native browser API)|
| State        | Context API + localStorage    |

---

## 🗂️ Project Structure

```
unmute-frontend/
├── public/
│   └── index.html          # Google Fonts loaded here
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.js           # Top bar with XP badge, notification, avatar
│   │   ├── Sidebar.js          # Collapsible nav with XP progress bar
│   │   ├── SpeechRecorder.js   # MediaRecorder API with waveform animation
│   │   ├── ScoreCard.js        # SVG gauge + dimension bars + AI feedback
│   │   ├── ProgressChart.js    # Recharts AreaChart (weekly progress)
│   │   ├── DailyTaskCard.js    # Task checklist with XP rewards
│   │   └── GDRoom.js           # WebSocket chat room component
│   │
│   ├── pages/
│   │   ├── Login.js            # JWT login with demo credentials
│   │   ├── Register.js         # Registration w/ password strength meter
│   │   ├── Dashboard.js        # Stats, chart, tasks, quick actions
│   │   ├── Practice.js         # Topic picker + recorder + score
│   │   ├── InterviewMode.js    # HR/Tech/Behavioral question bank
│   │   ├── GroupDiscussion.js  # Room list + GDRoom integration
│   │   └── PersonalityModule.js# 5-tab: Body Language, Voice, GD, Types, Quiz
│   │
│   ├── services/
│   │   ├── api.js              # Axios instance + service functions
│   │   └── websocket.js        # WS singleton with auto-reconnect
│   │
│   ├── context/
│   │   └── AuthContext.js      # JWT + user state management
│   │
│   ├── App.js                  # Routes + protected/public wrappers
│   ├── index.js
│   └── index.css               # Tailwind + custom utilities + animations
│
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🌐 Backend Configuration

| Setting      | Value                        |
|--------------|------------------------------|
| API Base URL | `http://localhost:8080`      |
| WebSocket    | `ws://localhost:8080/ws/gd/{roomId}` |

Override via environment variables:

```bash
REACT_APP_API_URL=http://your-backend.com
REACT_APP_WS_URL=ws://your-backend.com/ws
```

---

## 🧠 Features

### 1. Authentication
- Login / Register pages with form validation
- JWT stored in `localStorage`, attached to all Axios requests
- Auto-redirect on 401 (token expiry)
- Protected routes — unauthenticated users redirected to `/login`

### 2. Dashboard
- Personalized greeting with day/streak info
- XP level progress bar
- Stats: Rating, Sessions, Global Rank, Streak
- Quick-access buttons to all modules
- Weekly progress chart (Recharts)
- Daily task checklist with XP rewards

### 3. Speech Practice
- 6 topic categories (Self-intro, Storytelling, Opinion, Debate, News, Freestyle)
- Browser recording via `MediaRecorder` API
- Audio uploaded to backend as `multipart/form-data`
- ScoreCard: overall + 5 dimensions (Fluency, Grammar, Vocabulary, Pronunciation, Confidence)
- Session history panel

### 4. Interview Mode
- 4 category tabs: HR, Technical, Behavioral (STAR), Situational
- Navigate questions with prev/next
- Records and submits answers to backend
- Answered questions tracked visually
- STAR method tips panel

### 5. Group Discussion
- Browse available rooms with participant counts
- Create new rooms with custom topic
- Real-time WebSocket chat (auto-reconnect + exponential backoff)
- Participant strip with speaking indicators

### 6. Personality Module
- **Body Language** – Posture, eye contact, gestures, facial expression
- **Voice & Tone** – Pitch, pace, volume, filler words, articulation
- **GD Strategies** – 6 structured strategies + Do's & Don'ts table
- **Personality Types** – Analyst, Diplomat, Sentinel, Explorer
- **Self-Assessment Quiz** – 4-question quiz with scored result

---

## 🎨 Design System

| Token          | Value                              |
|----------------|------------------------------------|
| Background     | `#0a0b14` (dark-900)               |
| Card bg        | `rgba(255,255,255,0.05)` glassmorphism |
| Primary        | `#3d57f7` → `#4f8cff` (blue)      |
| Accent         | `#8b5cf6` → `#a259ff` (purple)    |
| Neon Green     | `#00e5a0`                          |
| Neon Yellow    | `#ffe600`                          |
| Neon Pink      | `#ff5caa`                          |
| Font           | Inter (body) + Sora (display)      |

---

## 📄 License

MIT — built for learning and demo purposes.

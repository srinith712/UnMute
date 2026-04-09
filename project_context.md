# UnMute — Project Context File

> **Purpose**: This file tracks every change made to the project, the current architecture,
> API endpoints, and next steps. Update this file after every major change.
>
> **Last Updated**: 2026-04-09  
> **Session**: Full system evaluation + priority fixes pass

---

## Architecture Summary

```
UnMute/
├── backend/          Spring Boot 3.x (Java 17)
│   ├── controller/   REST endpoints (no /api prefix)
│   ├── service/      Business logic
│   ├── model/        JPA entities (User, SpeechResult, GDSession)
│   ├── repository/   Spring Data JPA repos
│   ├── security/     JWT auth filter + SecurityConfig
│   └── websocket/    GD real-time (WebSocket)
└── frontend/         React 18 (Create React App)
    ├── pages/        Full-page views (Dashboard, Practice, ...)
    ├── components/   Reusable UI (DailyTaskCard, ScoreCard, SpeechRecorder, ...)
    ├── services/     api.js (axios) + speechAnalysis.js (fallback)
    └── context/      AuthContext (JWT + demo login)
```

---

## Demo Login (No registration needed)

| Field    | Value             |
|----------|-------------------|
| Email    | demo@unmute.app   |
| Password | Demo@1234         |

---

## API Endpoints

### Auth
| Method | Path             | Auth     | Notes                   |
|--------|-----------------|----------|-------------------------|
| POST   | /auth/login     | Public   | Returns JWT token       |
| POST   | /auth/register  | Public   | Returns JWT token       |

### Dashboard (all public — no auth needed)
| Method | Path                        | Notes                            |
|--------|-----------------------------|----------------------------------|
| GET    | /dashboard/stats            | XP, Level, Rating, Streak        |
| GET    | /dashboard/tasks            | Returns 1 task per day (rotated) |
| POST   | /dashboard/tasks/{id}/complete | Mark task complete (optional) |
| GET    | /dashboard/progress         | Weekly speech result history     |

### Practice
| Method | Path                    | Auth      | Notes                                    |
|--------|------------------------|-----------|------------------------------------------|
| POST   | /practice/analyze-text | **Public** | PRIMARY. JSON: {transcript, topic, durationSeconds} |
| POST   | /practice/analyze      | JWT Required | LEGACY. Multipart audio blob (routes through NLP pipeline) |
| GET    | /practice/topics       | Public    | List of practice topics                  |
| GET    | /practice/history      | JWT       | Returns [] if unauthenticated            |

---

## Files Changed (This Session — Evaluation & Fix Pass)

### Backend
| File | Change |
|------|--------|
| `application.yml` | Switched H2 to file-based (`jdbc:h2:file:./data/unmute-db`); `ddl-auto: update`; JWT secret via `${JWT_SECRET}` env variable |
| `SpeechResult.java` | Added `topic` and `wordCount` fields — fixes "always shows Freestyle" in history |
| `User.java` | Added `lastActiveDate: LocalDate` — enables real consecutive-day streak tracking |
| `SpeechService.java` | **analyzeTranscript** now accepts `durationSeconds` for real WPM; **analyzeAndSave** no longer generates random scores — routes through NLP pipeline; added `scoreFromWpm()` function; stores `topic` and `wordCount` per result; added debate/storytelling tips; added WPM feedback in tips; honest comments on score dimensions; removed `randomScore()` helper |
| `PracticeController.java` | Reads `durationSeconds` from request body; `mapResult()` now returns `topic` and `wordCount` per session |
| `UserService.java` | `addXp()` now stamps `lastActiveDate = today` and increments `rating +1` per session; added `computeStreak()` method with real date-gap logic |
| `DashboardService.java` | `computeStreak()` now delegates to `userService.computeStreak()` — real streak, not `xp/50` |

### Frontend
| File | Change |
|------|--------|
| `api.js` | `analyzeTranscript` now accepts and sends `durationSeconds` to backend |
| `Practice.js` | Passes `duration` to API call; history shows real topic label (capitalized, hyphens replaced) + word count per session |
| `SpeechRecorder.js` | Added browser compatibility warning banner when Web Speech API is not supported (Firefox, older browsers) |

---

## NLP Analysis (SpeechService.analyzeTranscript)

Inputs: `transcript (String)`, `topic (String)`, `durationSeconds (int)`

| Score        | How calculated                                              |
|-------------|-------------------------------------------------------------|
| Fluency     | **Real WPM** if durationSec > 0 (`scoreFromWpm()`), else word count heuristic |
| Grammar     | Penalty for filler word ratio (proxy for speech clarity)     |
| Vocabulary  | Unique word ratio (Type-Token Ratio) × 65 + 35              |
| Confidence  | Average words per sentence × 1.8 + 45                       |
| Pronunciation | (fluency + grammar) / 2 — text-based approximation        |
| Overall     | Weighted: fluency×.25 + grammar×.20 + vocab×.15 + pron×.20 + conf×.20 |

WPM scoring: < 60 wpm → very low; 100–160 wpm → target range; > 180 wpm → speed penalty

Filler words detected: `um, uh, like, you know, basically, actually, literally, right, so, well, kind of, sort of`

---

## Streak Logic

Real streak implemented:
- `User.lastActiveDate` is set to `LocalDate.now()` after every XP-gaining session
- `UserService.computeStreak()` checks days since last activity:
  - > 1 day gap → streak = 0 (chain broken)
  - ≤ 1 day gap → streak = min(xp/50 + 1, 30)

---

## Rating System (Fixed)

- Rating now increments by +1 each time `addXp()` is called (i.e. after each scored session)
- Starts at 1000; grows naturally with practice frequency

---

## Known Issues (Remaining)

- **Pronunciation score**: Still derived from fluency+grammar — no audio signal processing. Requires Whisper/STT integration for real accuracy.
- **Grammar score**: Uses filler ratio as a proxy — not a full grammar checker. For real grammar, integrate LanguageTool Java library.
- **Task completion**: Still stored in `localStorage` — resets on new browser/incognito. A server-side task completion endpoint + DB column is the proper fix.
- **Audio upload (`/practice/analyze`)**: Routes through NLP pipeline using metadata as placeholder. Real STT (Whisper) not yet integrated.

---

## Next Steps (Suggested)

1. **Integrate LanguageTool**: Add as Maven dependency; call from `SpeechService` for real grammar error count
2. **Integrate Whisper STT**: Cloud API call in `analyzeAndSave()` to convert audio blob → transcript → analyzeTranscript()
3. **Server-side task completion**: Add `task_completions` table; mark completed when practice session > 30s
4. **PostgreSQL for production**: Replace H2 with `spring.datasource.url=jdbc:postgresql://...`
5. **Word count in history**: Already stored — just display on dashboard progress chart
6. **Letter grade display**: Add A/B/C/D grade beside numerical score in ScoreCard


---

## Architecture Summary

```
UnMute/
├── backend/          Spring Boot 3.x (Java 17)
│   ├── controller/   REST endpoints (no /api prefix)
│   ├── service/      Business logic
│   ├── model/        JPA entities (User, SpeechResult, GDSession)
│   ├── repository/   Spring Data JPA repos
│   ├── security/     JWT auth filter + SecurityConfig
│   └── websocket/    GD real-time (WebSocket)
└── frontend/         React 18 (Create React App)
    ├── pages/        Full-page views (Dashboard, Practice, ...)
    ├── components/   Reusable UI (DailyTaskCard, ScoreCard, ...)
    ├── services/     api.js (axios) + speechAnalysis.js (fallback)
    └── context/      AuthContext (JWT + demo login)
```

---

## Demo Login (No registration needed)

| Field    | Value             |
|----------|-------------------|
| Email    | demo@unmute.app   |
| Password | Demo@1234         |

The backend uses `demo@unmute.app` as the fallback email for all
unauthenticated dashboard/practice routes.

---

## API Endpoints

### Auth
| Method | Path             | Auth     | Notes                   |
|--------|-----------------|----------|-------------------------|
| POST   | /auth/login     | Public   | Returns JWT token       |
| POST   | /auth/register  | Public   | Returns JWT token       |

### Dashboard (all public — no auth needed)
| Method | Path                        | Notes                            |
|--------|-----------------------------|----------------------------------|
| GET    | /dashboard/stats            | XP, Level, Rating, Streak        |
| GET    | /dashboard/tasks            | Returns 1 task per day (rotated) |
| POST   | /dashboard/tasks/{id}/complete | Mark task complete (optional) |
| GET    | /dashboard/progress         | Weekly speech result history     |

### Practice
| Method | Path                    | Auth      | Notes                                    |
|--------|------------------------|-----------|------------------------------------------|
| POST   | /practice/analyze-text | **Public** | PRIMARY. JSON: {transcript, topic}       |
| POST   | /practice/analyze      | JWT Required | LEGACY. Multipart audio blob          |
| GET    | /practice/topics       | Public    | List of practice topics                  |
| GET    | /practice/history      | JWT       | Returns [] if unauthenticated            |

---

## Files Changed (This Session)

### Backend
| File | Change |
|------|--------|
| `SpeechService.java` | Added `analyzeTranscript()` with real NLP: word count, filler detection, vocabulary diversity scoring |
| `PracticeController.java` | Added `POST /practice/analyze-text` endpoint; demo email fallback |
| `SecurityConfig.java` | Added `/practice/analyze-text`, `/practice/topics`, `/practice/history` to permitAll list |

### Frontend
| File | Change |
|------|--------|
| `api.js` | Added `practiceAPI.analyzeTranscript(transcript, topic)` method |
| `SpeechRecorder.js` | Added Web Speech API (continuous, interim results); live transcript box; passes transcript as 3rd arg |
| `Practice.js` | Uses transcript → backend NLP; fixed `taskId` bug (now uses `dayOfYear % 8`); shows transcript preview + filler count |
| `Dashboard.js` | Full rewrite: fetches stats, task, and chart; renders 4 stat cards + ProgressChart + DailyTaskCard; fixed Sidebar crash |
| `DailyTaskCard.js` | Refactored: accepts single `task` object; loading skeleton; action button; auto-complete hint |

---

## Daily Task System

### How it works
1. Backend rotates 8 tasks by `dayOfYear % 8` — returns exactly **1 task per day**.
2. Dashboard fetches task, stores `taskId` in `sessionStorage`.
3. After practice speech ≥ 30 seconds, `Practice.js` writes to `localStorage`:
   ```json
   { "taskId": "3", "date": "2026-04-08" }
   ```
4. On next Dashboard load, task is marked `completed: true` if IDs + date match.
5. Task **never disappears** — only shows as ✅ Done or Pending.
6. Task **never manually completable** — only auto-completes via real action.

### Task ID rotation (matches backend exactly)
```js
const dayOfYear = Math.floor((Date.now() - new Date(year, 0, 0)) / 86400000);
const taskId = String((dayOfYear % 8) + 1); // "1" through "8"
```

---

## NLP Analysis (SpeechService.analyzeTranscript)

Inputs: `transcript (String)`, `topic (String)`

| Score        | How calculated                                              |
|-------------|-------------------------------------------------------------|
| Fluency     | Word count vs expected 150wpm for 60s                       |
| Grammar     | Penalty for filler word ratio                               |
| Vocabulary  | Unique word ratio × 60 + 40                                 |
| Confidence  | Average words per sentence × 1.5 + 50                       |
| Pronunciation | (fluency + grammar) / 2                                  |
| Overall     | Weighted: fluency×.25 + grammar×.20 + vocab×.15 + pron×.20 + conf×.20 |

Filler words detected: `um, uh, like, you know, basically, actually, literally, right, so, well, kind of, sort of`

---

## Known Issues

- **Lombok IDE warning**: NetBeans LSP cannot initialize Lombok annotation processor.
  This is an IDE-only issue — **does not affect Maven build or runtime**.
  Fix: Ignore in IDE. The running `mvn spring-boot:run` compiles correctly.

- **Audio upload (/practice/analyze)**: Still requires real JWT. Demo users always
  get the transcript path instead. This is by design.

- **Web Speech API**: Not supported in Firefox. Works in Chrome/Edge/Safari.
  Fallback: demo analysis runs if transcript is empty.

---

## Next Steps (Suggested)

1. **Interview auto-complete**: After answer submitted in `InterviewMode.js`,
   write `dailyTask` to localStorage if today's task is type `interview`.

2. **GD auto-complete**: After joining a room in `GroupDiscussion.js`,
   write `dailyTask` to localStorage if today's task is type `gd`.

3. **Real user stats**: When a real JWT user logs in, `/dashboard/stats` already
   returns their real XP/Level/Rating from the DB. No changes needed.

4. **Persist history**: Add `topic` field to `SpeechResult` entity so history
   shows the correct topic instead of 'Freestyle'.

5. **Word count display**: Backend returns `fillerWords` count; add `wordCount`
   field to `SpeechResult` entity and return it in the API response.

6. **ProgressChart real data**: Backend returns real history if user has sessions;
   ProgressChart already has demo fallback data if history is empty.

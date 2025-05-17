# CodeCast Backend

A developer-centric video sharing platform backend with real-time features, role-based access, and analytics.

## 🚀 Features
- User authentication (JWT, roles: viewer, creator, admin)
- Video upload (YouTube/Vimeo embed), tagging, code snippets, quiz
- Comments (anonymous or authenticated)
- Reactions (like/dislike/emoji)
- Skill tag leaderboard
- Watch party (real-time sync & chat via Socket.io)
- Public creator portfolio
- Admin moderation & analytics

## 🛠️ Setup
```bash
cd backend
npm install
npx nodemon server.js
```

## 🌐 API Reference

### Auth
#### Register
`POST /api/auth/register`
```json
{
  "username": "alice",
  "email": "alice@email.com",
  "password": "password123",
  "role": "creator" // or "viewer", "admin"
}
```
**Response:**
```json
{
  "message": "User registered",
  "user": { "id": 1, "username": "alice", "email": "alice@email.com", "role": "creator" }
}
```

#### Login
`POST /api/auth/login`
```json
{
  "email": "alice@email.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "<JWT>",
  "user": { "id": 1, "username": "alice", "email": "alice@email.com", "role": "creator" }
}
```

---

### Videos
#### Upload Video (Creator only)
`POST /api/videos` (JWT required)
```json
{
  "title": "React Hooks Walkthrough",
  "description": "A deep dive into React hooks.",
  "url": "https://youtube.com/embed/xyz",
  "tags": ["React", "Hooks"],
  "difficulty": "Intermediate",
  "category": "Frontend",
  "duration": 900,
  "codeSnippets": [
    { "timestamp": 120, "code": "useEffect(() => {...})", "language": "js" }
  ],
  "quiz": [
    { "question": "What does useEffect do?", "options": ["A", "B"], "answer": 0 }
  ],
  "isPublic": true
}
```
**Response:** Video object

#### List Videos
`GET /api/videos?tag=React&category=Frontend&difficulty=Intermediate&search=React&page=1&limit=10&sort=uploadDate`
**Response:** Array of video objects

#### Get Video (increments views)
`GET /api/videos/:id`
**Response:** Video object

#### Update Video (Creator only)
`PUT /api/videos/:id` (JWT required)
**Body:** Same as upload

#### Delete Video (Creator only)
`DELETE /api/videos/:id` (JWT required)

#### Trending Tags Leaderboard
`GET /api/videos/leaderboard/tags?week=2024-05-16`
**Response:** Array of tag stats

---

### Comments
#### Add Comment (anonymous or JWT)
`POST /api/comments/:videoId`
```json
{
  "content": "Great explanation!"
}
```
**Response:** Comment object

#### List Comments
`GET /api/comments/:videoId`
**Response:** Array of comments

#### Moderate/Delete (Admin)
`PUT /api/comments/moderate/:id` (JWT admin)
```json
{ "isSpam": true }
```
`DELETE /api/comments/:id` (JWT admin)

---

### Reactions
#### Like/Dislike/Emoji (JWT)
`POST /api/reactions/:videoId`
```json
{ "type": "like" } // or "dislike", "emoji"
```
**Response:** Reaction object

#### List Reactions
`GET /api/reactions/:videoId`
**Response:** Array of reactions

---

### Portfolio
#### Public Creator Portfolio
`GET /api/portfolio/:username`
**Response:**
```json
{
  "creator": { "username": "alice", "id": 1 },
  "topVideos": [ ... ],
  "featuredStack": ["React", "Hooks"]
}
```

---

### Quiz
#### Add Quiz (Creator only)
`POST /api/quiz/:videoId` (JWT required)
```json
{
  "quiz": [
    { "question": "What is useState?", "options": ["A", "B"], "answer": 0 }
  ]
}
```
#### Get Quiz
`GET /api/quiz/:videoId`
**Response:** Array of quiz questions

---

### Watch Party
#### Create Party (JWT)
`POST /api/watchparty`
```json
{ "videoId": 1 }
```
#### Join Party (JWT)
`POST /api/watchparty/:id/join`
#### List Parties
`GET /api/watchparty`

---

### Watch History
#### Add to History (JWT)
`POST /api/history/:videoId`
#### Get User History (JWT)
`GET /api/history`

---

### Admin
#### List Users
`GET /api/admin/users` (JWT admin)
#### Suspend/Ban User
`PUT /api/admin/users/:id/status` (JWT admin)
```json
{ "status": "banned" }
```
#### List Videos
`GET /api/admin/videos` (JWT admin)
#### Platform Analytics
`GET /api/admin/analytics` (JWT admin)
**Response:**
```json
{
  "topVideo": { ... },
  "tags": [ ... ],
  "creators": [ ... ]
}
```

---

## 🟢 Real-Time Watch Party (Socket.io)
- Connect to: `ws://localhost:5000/watchparty`
- Events:
  - `join` { partyId, userId }
  - `sync` { partyId, action, time }
  - `chat` { partyId, userId, message }
  - `cursor` { partyId, userId, time }

---

## License
MIT 
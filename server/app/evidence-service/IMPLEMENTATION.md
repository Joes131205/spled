# Evidence Service - MVP Implementation Guide

## 📋 Overview

The **Evidence Service** is a NestJS-based microservice that manages evidence submissions and verification for group project work. It enables team members to submit proof of work and allows peer/leader verification.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server/app/evidence-service
npm install
```

### 2. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 3. Start the Service
```bash
npm run start:dev
```

The service will run on `http://localhost:3001` and API docs at `http://localhost:3001/docs`

---

## 📚 API Endpoints

### 1. **Upload Evidence for a Task**
```
POST /api/evidence/:taskId
```

**Request Body:**
```json
{
  "uploadedBy": "user-123",
  "fileUrl": "https://drive.google.com/file/d/...",
  "description": "Implemented user authentication module"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "evidence-uuid",
    "taskId": "task-123",
    "uploadedBy": "user-123",
    "fileUrl": "https://drive.google.com/file/d/...",
    "description": "Implemented user authentication module",
    "isVerified": false,
    "verifiedBy": null,
    "verificationNotes": null,
    "verificationDate": null,
    "createdAt": "2026-05-01T12:00:00Z",
    "updatedAt": "2026-05-01T12:00:00Z"
  },
  "message": "Evidence uploaded successfully"
}
```

---

### 2. **Get All Evidence for a Task**
```
GET /api/evidence/task/:taskId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "evidence-1",
      "taskId": "task-123",
      "uploadedBy": "user-123",
      "fileUrl": "https://...",
      "isVerified": false,
      "verifiedBy": null,
      "createdAt": "2026-05-01T12:00:00Z",
      "updatedAt": "2026-05-01T12:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 3. **Get All Evidence for a Project (with Analytics)**
```
GET /api/evidence/project/:projectId?taskIds=task1,task2,task3
```

**Query Parameters:**
- `taskIds` (required): Comma-separated list of task IDs in the project

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "evidence-1",
      "taskId": "task-1",
      "uploadedBy": "user-123",
      "fileUrl": "https://...",
      "isVerified": true,
      "verifiedBy": "user-456",
      "verificationDate": "2026-05-01T13:00:00Z"
    }
  ],
  "analytics": {
    "totalEvidences": 5,
    "verifiedEvidences": 3,
    "pendingEvidences": 2,
    "verificationRate": "60.00"
  }
}
```

---

### 4. **Verify/Reject Evidence**
```
PATCH /api/evidence/verify/:evidenceId
```

**Request Body:**
```json
{
  "verifiedBy": "user-456",
  "isVerified": true,
  "verificationNotes": "Code looks good and meets requirements"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "evidence-1",
    "taskId": "task-123",
    "uploadedBy": "user-123",
    "fileUrl": "https://...",
    "isVerified": true,
    "verifiedBy": "user-456",
    "verificationNotes": "Code looks good and meets requirements",
    "verificationDate": "2026-05-01T13:00:00Z",
    "createdAt": "2026-05-01T12:00:00Z",
    "updatedAt": "2026-05-01T13:00:00Z"
  },
  "message": "Evidence verified successfully"
}
```

---

### 5. **Get Pending Evidence (Awaiting Verification)**
```
GET /api/evidence/pending?taskIds=task1,task2,task3
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "evidence-2",
      "taskId": "task-2",
      "uploadedBy": "user-789",
      "fileUrl": "https://...",
      "isVerified": false,
      "createdAt": "2026-05-01T12:30:00Z"
    }
  ],
  "total": 1
}
```

---

### 6. **Get Member Contribution Analytics**
```
GET /api/evidence/analytics/:memberId?taskIds=task1,task2,task3
```

**Response:**
```json
{
  "success": true,
  "data": {
    "memberId": "user-123",
    "totalEvidenceSubmissions": 4,
    "verifiedEvidenceCount": 3,
    "verificationRate": "75.00",
    "latestSubmission": "2026-05-01T13:00:00Z"
  }
}
```

---

### 7. **Delete Evidence**
```
DELETE /api/evidence/:evidenceId
```

**Response:**
```json
{
  "success": true,
  "message": "Evidence deleted successfully"
}
```

---

## 💾 Database Schema

### Evidence Model
```prisma
model Evidence {
  id                String   @id @default(uuid())
  taskId            String
  uploadedBy        String
  fileUrl           String
  description       String?
  isVerified        Boolean  @default(false)
  verifiedBy        String?
  verificationNotes String?
  verificationDate  DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([taskId])
  @@index([uploadedBy])
  @@index([verifiedBy])
}
```

---

## 🔑 Key Features (MVP)

### ✅ Evidence Submission
- Team members submit proof of work (file URLs)
- Support for: GDrive links, GitHub commits, screenshots, etc.
- Optional descriptions for context
- Timestamped submissions

### ✅ Evidence Verification
- Peer/leader verification workflow
- Approve or reject submissions
- Add verification notes
- Track who verified and when

### ✅ Analytics
- **Project-level**: Total, verified, and pending evidence count
- **Member-level**: Contribution metrics and submission history
- **Verification Rate**: Percentage of approved evidence
- **Pending Tracking**: Identify evidence awaiting review

### ✅ Error Handling
- Comprehensive validation
- Clear error messages
- Proper HTTP status codes (201, 400, 404, etc.)

---

## 🛡️ Best Practices

### 1. **Input Validation**
- All DTOs use `class-validator`
- URL validation for `fileUrl`
- Required fields validation
- Auto-whitelist of fields (no extra data accepted)

### 2. **Error Handling**
```
- 400 Bad Request: Missing/invalid fields
- 404 Not Found: Evidence or task not found
- 200 OK: Successful operations
- 201 Created: Evidence uploaded
```

### 3. **Security Considerations** (Future Enhancement)
- Add role-based access control (Leader can verify, Members can submit)
- Add authorization checks (Users can only submit their own evidence)
- Add audit logging for all verification actions

---

## 📊 MVP Scope

### ✅ Implemented Features
- [x] Upload evidence for a task
- [x] Get evidence by task
- [x] Get evidence by project
- [x] Verify/reject evidence
- [x] Get pending evidence
- [x] Member contribution analytics
- [x] Delete evidence
- [x] Full CRUD operations
- [x] API documentation (Swagger)

### 🔮 Future Enhancements
- [ ] File upload storage (AWS S3, GCS)
- [ ] Webhook integrations (GitHub, Google Drive)
- [ ] Evidence expiry/archival
- [ ] Automated verification rules
- [ ] Email notifications on verification
- [ ] Evidence versioning
- [ ] Bulk operations
- [ ] Advanced filtering and search

---

## 🧪 Testing (Manual Endpoints)

### Upload Evidence
```bash
curl -X POST http://localhost:3001/api/evidence/task-123 \
  -H "Content-Type: application/json" \
  -d '{
    "uploadedBy": "user-123",
    "fileUrl": "https://drive.google.com/file/d/example",
    "description": "Task implementation"
  }'
```

### Get Evidence for Task
```bash
curl http://localhost:3001/api/evidence/task/task-123
```

### Get Project Analytics
```bash
curl http://localhost:3001/api/evidence/project/project-1?taskIds=task1,task2,task3
```

### Verify Evidence
```bash
curl -X PATCH http://localhost:3001/api/evidence/verify/evidence-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "verifiedBy": "user-456",
    "isVerified": true,
    "verificationNotes": "Looks good"
  }'
```

---

## 📁 Project Structure

```
evidence-service/
├── src/
│   ├── db/
│   │   └── prisma.client.ts          # Prisma client setup
│   ├── utils/
│   │   └── dto/
│   │       ├── create-evidence.dto.ts
│   │       ├── verify-evidence.dto.ts
│   │       └── index.ts
│   ├── evidences/
│   │   ├── evidences.controller.ts
│   │   ├── evidences.service.ts
│   │   └── evidences.module.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

---

## 🔗 Integration Points

### With Project Service
- **Input**: `taskId` (from Project Service)
- **Output**: Evidence status for task completion
- **Use**: Project service queries evidence when updating task status

### With Auth Service
- **Input**: `uploadedBy`, `verifiedBy` (user IDs from Auth Service)
- **Output**: User contribution data
- **Use**: Auth service can query member analytics

### With Ghost Buster Service
- **Input**: Tasks with pending evidence
- **Output**: Reminder notifications
- **Use**: Ghost Buster service checks pending evidence for reminders

---

## 📝 Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/evidence_db

# Server
PORT=3001
NODE_ENV=development
```

---

## 🚀 Next Steps

1. **Project Service Implementation** - Create projects and tasks
2. **Integration Testing** - Connect Evidence Service with other services
3. **Authentication** - Add role-based access control
4. **Advanced Features** - File uploads, webhooks, automated verification

---

**Status**: ✅ MVP Complete
**Last Updated**: May 2026
**Version**: 1.0.0-alpha

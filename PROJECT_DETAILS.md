# Group Task Splitter - Project Details

## 📋 Executive Summary

**Group Task Splitter** is a web-based task management system designed to ensure fairness and accountability in group work environments. It addresses the challenges of collaborative academic projects by providing transparent task distribution, contribution tracking, and evidence-based evaluation mechanisms.

---

## 🎯 Project Objectives

1. **Eliminate Free-Rider Problem**: Implement evidence-based contribution tracking to prevent unfair workload distribution
2. **Ensure Fair Evaluation**: Provide transparent metrics for lecturers to assess individual contributions objectively
3. **Improve Task Coordination**: Centralize task management and communication for better group synchronization
4. **Support Diverse Schedules**: Enable asynchronous collaboration for students with conflicting schedules
5. **Automate Accountability**: Implement automated reminders and tracking to reduce manual follow-up burden

---

## 👥 Target User Personas

### 1. **Sarah - The Ambitious Leader**

-   **Profile**: High-achieving project leader (IPK 3.9), perfectionist
-   **Pain Points**: Difficulty tracking team progress, uncertainty about member contributions, need for proof of accountability
-   **Needs**: Clear visualization of contribution metrics, evidence documentation

### 2. **Rian - The Ghost Member**

-   **Profile**: Passive, disengaged, last-minute worker
-   **Pain Points**: Misses important information, unclear task assignments, procrastination
-   **Needs**: Clear task notifications, structured communication, deadline reminders

### 3. **Kevin - The Overbooked Member**

-   **Profile**: Heavily involved in multiple commitments, poor time management
-   **Pain Points**: Forgets deadlines, poor quality work due to time pressure
-   **Needs**: Aggressive reminders, clear deadline visibility

### 4. **Putri - The Insecure Learner**

-   **Profile**: Lacks technical confidence, new to programming
-   **Pain Points**: Intimidated to take challenging tasks, non-technical contributions undervalued
-   **Needs**: Support for diverse contribution types, confidence building

### 5. **Dimas - The Freelancer**

-   **Profile**: Works part-time while studying, asynchronous availability
-   **Pain Points**: Scheduling conflicts, slow response time, suspected of not contributing
-   **Needs**: Asynchronous work tracking, proof of work completion

---

## ✨ Key Features

### 1. **Weighted Tasking System**

-   Tasks assigned with difficulty levels: Easy, Medium, Hard
-   Fair workload distribution based on task complexity
-   Clear visibility of work distribution from project inception

### 2. **Evidence Locker**

-   Mandatory proof of work submission before task completion
-   Supported evidence types: GDrive links, Git commits, screenshots
-   Peer verification requirement for task approval
-   Anti-free-rider mechanism with documented proof trail

### 3. **Ghost Buster Protocol**

-   Progressive notification system for inactive tasks
-   Automated reminders at H-3, H-2, H-1 before deadlines
-   Reduces manual follow-up burden on project leaders
-   Encourages consistent task progress

### 4. **Lecturer Access Portal**

-   Read-only access code for instructors
-   Real-time contribution visualization (pie charts, metrics)
-   No registration required for lecturer access
-   Objective data for individual assessment

### 5. **Kick Member Log**

-   Managed removal of inactive members
-   Detailed logging of removal reasons
-   Audit trail for accountability reporting
-   Legitimate documentation for lecturer notification

### 6. **Contribution Analytics Dashboard**

-   Visual representation of member contributions
-   Task progress tracking and status monitoring
-   Individual performance metrics
-   Team workload distribution analysis

---

## 🏗️ System Architecture

### **Frontend (Web)**

-   **Framework**: React with TanStack Router
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS (via Biome)
-   **Location**: `/web`

### **Backend Services (Microservices)**

-   **Framework**: NestJS
-   **Architecture Pattern**: Microservices

#### Service Components:

1. **Auth Service** (`/server/app/auth-service`)

    - User authentication and authorization
    - Profile management
    - Role-based access control

2. **Project Service** (`/server/app/project-service`)

    - Project creation and management
    - Task management and assignment
    - Project workflow coordination

3. **Evidence Service** (`/server/app/evidence-service`)

    - Proof of work submission and storage
    - Evidence verification workflow
    - Contribution tracking

4. **Ghost Buster Service** (`/server/app/ghost-buster-service`)
    - Notification and reminder system
    - Deadline monitoring
    - Automated escalation protocols

### **Data Layer**

-   **Database**: Prisma ORM for database management
-   **Shared Database Library**: Located in `/server/libs/common`
-   **Schema-driven Development**: Prisma schema-driven approach

### **Shared Resources**

-   **Shared Middleware** (`/server/shared`)
    -   Authentication middleware
    -   Role-based access control middleware
-   **Common Utilities**: Shared DTOs and utilities across services

---

## 🔄 User Workflows

### **Project Leader Workflow**

1. Create new project
2. Invite team members via email/username
3. Create tasks with difficulty weights
4. Monitor member contributions through dashboard
5. Review submitted evidence
6. Generate lecturer access code
7. Manage team members (kick if necessary)

### **Team Member Workflow**

1. Accept project invitation
2. View assigned tasks
3. Update task status (In Progress → Done)
4. Submit proof of work (Evidence Locker)
5. Await peer verification
6. Receive notifications for deadline reminders

### **Lecturer Workflow**

1. Receive project access code
2. Access read-only dashboard
3. View contribution pie charts and metrics
4. Assess individual contributions
5. Make informed grading decisions

---

## 🗄️ Database Schema Structure

Each microservice maintains its own Prisma schema:

-   **Auth Service**: User profiles, authentication credentials, roles
-   **Project Service**: Projects, tasks, task assignments, weighted difficulty
-   **Evidence Service**: Evidence submissions, verification status, proof metadata
-   **Ghost Buster Service**: Notification history, deadline tracking, escalation logs

---

## 🛠️ Technology Stack

### **Frontend**

-   React 18+
-   TypeScript
-   TanStack Router for routing
-   Vite for build optimization
-   Biome for code quality

### **Backend**

-   Node.js
-   NestJS framework
-   TypeScript
-   Prisma ORM
-   PostgreSQL (recommended)
-   Turborepo for monorepo management

### **Development Tools**

-   ESLint for code linting
-   Jest for testing
-   TypeScript for type safety
-   Git for version control

---

## 📊 Key Metrics & Analytics

### **Contribution Metrics**

-   Task completion rate per member
-   Weighted contribution score
-   Evidence submission quality
-   Deadline compliance rate

### **Project Metrics**

-   Overall project completion percentage
-   Task distribution fairness index
-   Team engagement level
-   Bottleneck identification

### **Behavioral Insights**

-   Member reliability scoring
-   Response time patterns
-   Contribution consistency
-   Risk identification for inactive members

---

## 🔐 Security & Access Control

-   **Role-Based Access Control (RBAC)**

    -   Project Leader: Full access to project management
    -   Team Member: Limited to assigned tasks
    -   Lecturer: Read-only access via access code

-   **Authentication**

    -   Secure login/registration system
    -   Email-based member invitations
    -   Access code for lecturer portal

-   **Data Privacy**
    -   Evidence privacy within project scope
    -   Lecturer access restricted to read-only views
    -   Audit logging of all modifications

---

## 🚀 Future Enhancement Opportunities

1. **Advanced Analytics**

    - Machine learning for workload prediction
    - Early warning system for at-risk members

2. **Integration Capabilities**

    - GitHub webhook integration for commit tracking
    - Google Drive API integration for file proof
    - Slack/Discord notifications

3. **Gamification**

    - Achievement badges for consistent contributors
    - Leaderboards for friendly competition
    - Reward system for quality submissions

4. **Extended Functionality**

    - Inter-project task dependencies
    - Resource allocation optimization
    - Multi-class project management

5. **Mobile Support**
    - Native mobile app for iOS/Android
    - Push notifications for deadline alerts

---

## 📝 Use Cases

| Use Case                   | Actor     | Description                            |
| -------------------------- | --------- | -------------------------------------- |
| **Login/Register**         | All Users | Authenticate or create account         |
| **Create Project**         | Leader    | Initialize new project                 |
| **Create Task**            | Leader    | Add tasks with difficulty weights      |
| **Assign Task**            | Leader    | Delegate work to members               |
| **Submit Evidence**        | Member    | Upload proof of work                   |
| **Verify Evidence**        | Member    | Peer review of completed work          |
| **View Analytics**         | Leader    | Monitor contribution metrics           |
| **Access Lecturer Portal** | Lecturer  | Review project metrics via access code |
| **Send Notifications**     | System    | Remind members of upcoming deadlines   |
| **Manage Members**         | Leader    | Add, remove, or modify member roles    |
| **Update Profile**         | All Users | Modify personal account information    |
| **View Task Status**       | All Users | Check progress of assigned work        |

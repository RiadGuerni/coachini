# 🏋️‍♂️ Coachini - Backend API

**Coachini** is a backend system designed to help fitness coaches manage their clients more efficiently. Coaches can showcase certifications, receive payments, chat with clients, and create workout plans — all supported by a scalable backend architecture.

---

## 🚧 Project Status

🔐 **Authentication module completed**  
⚙️ Currently refining logging and error handling  
🧩 Core features in development

---

## ✨ Features (Planned)

- 🔐 **Authentication**
  - Email/password login
  - OAuth login via Google and Discord
  - JWT access & refresh tokens

- 🧑‍🏫 **Coach Profile**
  - Certificate uploads & public profiles

- 💳 **Payments**
  - Stripe integration for selling plans

- 💬 **Real-Time Chat**
  - WebSocket communication between coaches and clients

- 📋 **Workout Management**
  - Coaches can assign workouts and track client progress

---

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com)  
- **Database**: PostgreSQL  
- **Cache/Session Store**: Redis  
- **Auth**: JWT, Passport.js, Google & Discord OAuth  
- **Real-Time**: WebSockets (planned via `@nestjs/websockets`)  
- **Payments**: Stripe (planned)  
- **Containerization**: Docker + DevContainer setup

---

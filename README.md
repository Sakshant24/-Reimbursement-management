# Reimbursement Management System

> A full-stack application that automates expense tracking with AI OCR, live currency conversion, and a dynamic multi-level approval workflow engine.

## Overview
We built this system to eliminate the tedious back-and-forth of the manual corporate reimbursement process. Instead of hardcoding who approves what, this platform features an intelligent, recursive **Rule Builder Engine**. Admins can dynamically map out approval routes—whether it’s a simple Manager-to-Finance pipeline, a percentage-based board vote, or a complex hybrid bypass scenario (like auto-approving if the CFO signs off early).

Coupled with a custom-built "Dark Financial Terminal" aesthetic, this is an enterprise-grade solution that handles the heavy lifting autonomously so employees can focus on their actual work.

## 🚀 Key Features

* **AI Neural Receipt Scanner:** Powered entirely by client-side Tesseract.js OCR, employees can upload photos of their receipts. The AI automatically parses the image to extract the merchant name, date, and exact amount—typing it into the form for them.
* **Live Currency Conversion:** Integrated with third-party real-time exchange APIs. If an employee logs an expense in Euros (EUR) while the corporate headquarter base is Indian Rupees (INR), the system mathematically standardizes the conversion instantly before database insertion.
* **Dynamic Workflow Engine:** Fully customizable approval schemas. 
* **Role-Based Access Control (RBAC):** Secure layout locked down natively by HTTP JSON Web Tokens (JWT) and `express-validator`. The UI aggressively shifts capabilities depending on if you log in as an Admin, Manager, or Employee.

## 💻 Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS, Axios, Tesseract.js (OCR)
* **Backend:** Node.js, Express.js
* **Database Pipeline:** MySQL paired dynamically with Prisma ORM
* **Security:** bcryptjs (password hashing), jsonwebtoken (auth states)

## 📁 Project Structure

The project is natively divided into two decoupled monolithic layers:

* `/frontend` — The React UI. Completely handles all the views, dashboard state management via Context API, strict Protected Routes, and client-side AI heavy-lifting (OCR).
* `/backend` — The strict API layer. Safely manages all database mutations, Prisma transactions, routing, and the core algorithmic logic evaluating exactly whose queue an expense should jump to next.

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have Node.js and an active MySQL server running.

### 2. Backend Setup
```bash
cd backend
npm install
```
* Create a `.env` file mapping `DATABASE_URL` and `JWT_SECRET`.
* Push the schema to the database and seed the demo cases:
```bash
npx prisma migrate dev
npx prisma db seed
```
* Spin up the API:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` to view the live dashboard!

---
*Built dynamically for modern financial scaling.*

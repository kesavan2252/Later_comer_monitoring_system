# 🚀 Latecomer Management System

![Project Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Contributors](https://img.shields.io/github/contributors/kesavan/Latecomer-Management-System?style=flat-square)

📌 **Latecomer Management System** is a web-based platform that helps track and manage students arriving late to college. It includes **barcode scanning, attendance tracking, and an admin dashboard** for better monitoring.

## 🎯 Features

✅ **Student Attendance Tracking**  
✅ **Barcode/Manual Entry Scanner**  
✅ **Admin Panel for Report Management**  
✅ **Data Import & Export**  
✅ **Secure Authentication (JWT-based)**  
✅ **Department-wise Analysis & Dashboard**  
✅ **Supabase PostgreSQL Database Integration**  

## 🏗️ Tech Stack

![React](https://img.shields.io/badge/Frontend-React-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=flat-square)
![Express](https://img.shields.io/badge/API-Express.js-lightgrey?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=flat-square)
![Supabase](https://img.shields.io/badge/Cloud-Supabase-orange?style=flat-square)

## 📦 Installation & Setup

Clone the repository:
```bash
  git clone https://github.com/kesavan/Latecomer-Management-System.git
  cd Latecomer-Management-System
```

### 🔧 Backend Setup
1️⃣ **Install dependencies:**
```bash
cd server  
npm install
```
2️⃣ **Configure Environment Variables:**  
Create a `.env` file inside `server/` and add:
```env
PORT=5000
DATABASE_URL = <your_database_url>
SUPABASE_URL=<your_supabase_url>
JWT_TOKEN =<your_jwt_token > // for secure login and import,edit and delete operation
```
3️⃣ **Run Backend:**
```bash
npm start
```

### 🎨 Frontend Setup
1️⃣ **Install dependencies:**
```bash
cd client  
npm install
```
2️⃣ **Configure Environment Variables:**  
Create a `.env` file inside `client/` and add:
```env
VITE_API_BASE_URL=http://localhost:5000
```
3️⃣ **Run Frontend:**
```bash
npm run dev
```

## 📊 Database Schema

| Table | Columns |
|--------|--------------------------|
| **Students** | id, name, roll_no, department,|
| **Attendance** | id, student_id, date, time, status |
| **Admins** | id, username, password |

## 🚀 Deployment
The project is deployed on **Vercel** and connected to **Supabase PostgreSQL**.

🔗 **Live Demo:** [Click Here](https://later-comer-monitoring-system.vercel.app/)  

## 💡 Future Enhancements
🔹 **Admin Dashboard**  
🔹 **Analytics & Reports**  
🔹 **Multi-Role-Based Authentication**  

## 🤝 Contribution
**Want to improve this project?** Feel free to contribute! 🚀

1. Fork the repo
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m "Added new feature"`)
4. Push to your branch (`git push origin feature-name`)
5. Open a **Pull Request** 🚀

## 📜 License
This project is open-source under the **MIT License**.

---
### 💬 Connect with Me!
📧 Email: suryakesavan6@gmail.com  
🔗 LinkedIn: [Kesavan T](https://www.linkedin.com/in/kesavan-surya-a446a725a/)  
🚀 Portfolio: [Coming Soon!]

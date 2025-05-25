# 💊 ReMed - Medication Reminder Application

**ReMed** is a comprehensive medication management system designed to help patients track medications, set reminders, and manage their health effectively.

---

## 🚀 Features

- **💼 Medicine Management**: Add, edit, and track medications.
- **⏰ Reminder System**: Customize reminders with:
  - Multiple daily reminders
  - Flexible timing windows
  - Custom alarm sounds
  - Snooze options
  - Critical medication prioritization
- **📈 Reporting**: Track medication adherence and health metrics.
- **👥 User Management**: Supports patients, family members, and healthcare providers.

---

## 🏗️ Project Structure

- **Frontend**: React-based web application
- **Backend**: Node.js / Express API
- **Database**: MySQL

---

## ⚙️ Setup Instructions (For Team Members)

### 🛠️ Prerequisites

- Node.js v14+
- npm
- MySQL 8.0+

---

### 📁 Clone the Repository

git clone [your-repository-url]
cd remed

### 🗃️ Database Setup
**1. Install MySQL if not already installed (see backend/MYSQL_SETUP.md).
2. Log in to MySQL:**

```bash
mysql -u root -p
```

**3. Create the database and user:**

```bash

CREATE DATABASE remed;
CREATE USER 'remed'@'localhost' IDENTIFIED BY 'remed_password';
GRANT ALL PRIVILEGES ON remed.* TO 'remed'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**4. Import the schema:**

```bash
mysql -u remed -p remed < backend/remed_database.sql
```

### 🔧 Backend Setup

```bash
cd backend
npm install
```

Create a .env file in the backend/ directory:

```bash
DB_HOST=localhost
DB_USER=remed
DB_PASSWORD=remed_password
DB_NAME=remed
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Start the backend server:
```bash
npm run dev
```

### 🎨 Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 👨‍👩‍👧‍👦 Team Workflow

**✅ Git Workflow**

```bash
# Always pull latest changes before starting work
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "Your descriptive commit message"

# Push your changes
git push origin feature/your-feature-name
```
Create a pull request to merge into main.

**🛠️ Database Schema Changes**
- Document schema changes in backend/db/migrations/ as .sql files
- Update db-update.js if needed
- Test your changes locally
- Notify the team about the changes

### 🌐 App Access
- **Frontend:** http://localhost:3000
- **Backend API**  http://localhost:5000

### 🧩 Troubleshooting

**❗ Port Already in Use**

```bash
sudo lsof -i :5000
kill -9 [PID]
```

### ❌ Database Connectivity Issues

- Ensure MySQL is running
- Verify credentials in .env
- Confirm the remed database and user exist with proper permissions

### 📅 Project Roadmap

- ✅ Implement medicine interaction warnings
- 🔍 Add image recognition for pill identification
- 🔗 Integrate with healthcare provider systems
- 📱 Develop mobile app versions

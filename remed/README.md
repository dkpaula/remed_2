# ReMed - Medication Reminder Application

ReMed is a comprehensive medication management system designed to help patients track their medications, set reminders, and manage their health effectively.

## Features

- **Medicine Management**: Add, edit, and track medications
- **Reminder System**: Set customized medication reminders with:
  - Multiple daily reminders
  - Flexible timing windows
  - Custom alarm sounds
  - Snooze options
  - Critical medication prioritization
- **Reporting**: Track medication adherence and health metrics
- **User Management**: Support for patients, family members, and healthcare providers

## Project Structure

- **Frontend**: React-based web application
- **Backend**: Node.js/Express API
- **Database**: MySQL

## Setup Instructions for Team Members

### Prerequisites

- Node.js v14+ and npm
- MySQL 8.0+
- Git

### 1. Clone the Repository

```bash
git clone [your-repository-url]
cd remed
```

### 2. Database Setup

1. Install MySQL if not already installed (see `backend/MYSQL_SETUP.md` for detailed instructions)
2. Log in to MySQL:
```bash
mysql -u root -p
```
3. Create the database and user:
```sql
CREATE DATABASE remed;
CREATE USER 'remed'@'localhost' IDENTIFIED BY 'remed_password';
GRANT ALL PRIVILEGES ON remed.* TO 'remed'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
4. Import the database from the SQL file:
```bash
mysql -u remed -p remed < backend/remed_database.sql
```

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file with the following content:
```
DB_HOST=localhost
DB_USER=remed
DB_PASSWORD=remed_password
DB_NAME=remed
JWT_SECRET=your_jwt_secret_key
PORT=5000
```
4. Start the backend server:
```bash
npm run dev
```

### 4. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```
2. Install dependencies:
```bash
npm install
```
3. Start the frontend development server:
```bash
npm run dev
```

## Working on the Project as a Team

### Workflow

1. Always pull the latest changes before starting work:
```bash
git pull origin main
```

2. Create a branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

3. Make your changes and commit them:
```bash
git add .
git commit -m "Your descriptive commit message"
```

4. Push your changes:
```bash
git push origin feature/your-feature-name
```

5. Create a pull request to merge your changes into the main branch

### Database Changes

If you need to modify the database schema:

1. Document all schema changes in a SQL file in `backend/db/migrations/`
2. Update the `db-update.js` script to include your changes
3. Test your changes locally before committing
4. Let the team know about the database changes

## Accessing the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Troubleshooting

### Server Already Running

If you get an error about the port already being in use:

```bash
# Find the process using port 5000
sudo lsof -i :5000

# Kill the process
kill -9 [PID]
```

### Database Connectivity Issues

If you have issues connecting to the database:

1. Verify MySQL is running
2. Check your database credentials in the `.env` file
3. Ensure the remed database exists and the user has proper permissions

## Project Roadmap

- [ ] Implement medicine interaction warnings
- [ ] Add image recognition for pill identification
- [ ] Integrate with healthcare provider systems
- [ ] Develop mobile app versions 
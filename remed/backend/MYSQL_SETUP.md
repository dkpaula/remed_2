# MySQL Setup for ReMed

This document provides instructions for setting up MySQL for the ReMed application.

## 1. Install MySQL

### macOS
```bash
# Using Homebrew
brew install mysql
```

### Windows
1. Download the MySQL installer from [MySQL website](https://dev.mysql.com/downloads/installer/)
2. Run the installer and follow the installation wizard

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
```

## 2. Start MySQL Service

### macOS
```bash
brew services start mysql
```

### Windows
MySQL should start automatically as a service, or you can start it from Services.

### Linux
```bash
sudo systemctl start mysql
```

## 3. Secure MySQL Installation

Set a root password and secure your installation:

```bash
sudo mysql_secure_installation
```

## 4. Create ReMed Database and User

Connect to MySQL as root:

```bash
mysql -u root -p
```

Then run these commands:

```sql
CREATE DATABASE remed;
CREATE USER 'remed_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON remed.* TO 'remed_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 5. Update ReMed Configuration

Edit the `config.js` file in the backend directory to match your MySQL credentials:

```javascript
// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'remed_user',  // or root, or whatever user you created
  password: 'your_password',
  database: 'remed'
};
```

## 6. Initialize the Database

Run the database schema setup script:

```bash
cd backend
node db-init.js
```

## 7. Update Database Schema

If you need to update the database schema to include all the required columns for the app, run:

```bash
cd backend
node db-update.js
```

## 8. Verify Connection

Test the database connection:

```bash
cd backend
node -e "require('./db').testConnection().then(result => console.log('Connection successful:', result));"
```

## Troubleshooting

### Connection Issues
- Ensure MySQL service is running
- Check the credentials in config.js
- Confirm that the remed database exists
- Make sure your MySQL user has the appropriate permissions

### Schema Problems
If you're seeing errors about missing columns:

```
Unknown column 'Custom_Sound' in 'field list'
Unknown column 'Flexible_Window' in 'field list'
Unknown column 'Description' in 'field list'
Unknown column 'Options' in 'field list'
```

Run the schema update script:

```bash
cd backend
node db-update.js
``` 
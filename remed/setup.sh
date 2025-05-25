#!/bin/bash

# ReMed Project Setup Script
# This script helps set up the ReMed project for development

echo "======================================================"
echo "ReMed Project Setup Script"
echo "======================================================"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "MySQL is not installed. Please install MySQL first."
    echo "See backend/MYSQL_SETUP.md for instructions."
    exit 1
fi

# Set up the database
echo "Setting up database..."
read -p "Enter MySQL root username [root]: " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}
read -sp "Enter MySQL root password: " MYSQL_PASSWORD
echo

# Create the database and user
echo "Creating database and user..."
mysql -u $MYSQL_USER -p$MYSQL_PASSWORD <<EOF
CREATE DATABASE IF NOT EXISTS remed;
CREATE USER IF NOT EXISTS 'remed'@'localhost' IDENTIFIED BY 'remed_password';
GRANT ALL PRIVILEGES ON remed.* TO 'remed'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -ne 0 ]; then
    echo "Error: Failed to create database or user."
    exit 1
fi

# Import the database schema
echo "Importing database schema..."
mysql -u remed -premed_password remed < backend/remed_database.sql

if [ $? -ne 0 ]; then
    echo "Error: Failed to import database schema."
    exit 1
fi

# Set up backend
echo "Setting up backend..."
cd backend
npm install

# Create .env file
echo "Creating .env file..."
cat > .env <<EOF
DB_HOST=localhost
DB_USER=remed
DB_PASSWORD=remed_password
DB_NAME=remed
JWT_SECRET=remed_secret_key_change_this_in_production
PORT=5000
EOF

# Set up frontend
echo "Setting up frontend..."
cd ../frontend
npm install

echo "======================================================"
echo "Setup complete!"
echo "======================================================"
echo "To start the backend server:"
echo "  cd backend && npm run dev"
echo ""
echo "To start the frontend server:"
echo "  cd frontend && npm run dev"
echo "======================================================" 
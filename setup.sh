#!/bin/bash

# AI Assessment Portal - Backend Auto-Installer
echo "------------------------------------------------"
echo "🚀 Initializing AI Assessment Backend Setup"
echo "------------------------------------------------"

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js not found. Please install it from https://nodejs.org/"
    exit 1
fi

echo "📦 Installing dependencies (Express, Nodemailer, etc.)..."
npm install

# Check for .env file
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  CRITICAL: Please open the .env file and add your EMAIL_USER and EMAIL_PASS."
fi

echo "------------------------------------------------"
echo "✅ Setup Complete!"
echo "To start the server, run: npm start"
echo "------------------------------------------------"

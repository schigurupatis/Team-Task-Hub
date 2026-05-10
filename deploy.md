# EC2 Deployment Guide - Team-Task-Hub

This document contains the step-by-step commands to deploy this project to an AWS EC2 instance running Ubuntu.

## 1. System Update & Dependencies
Run these commands to prepare the server and install Node.js 22 + Nginx.


# Update Ubuntu packages
sudo apt-get update -y

# Setup Node.js 22 (LTS) repository
curl -fsSL https://nodesource.com | sudo -E bash -

# Install Node.js and Nginx
sudo apt install -y nodejs nginx
```

## 2. Project Setup
Clone the repository and prepare the frontend build.


# Clone the repository
git clone https://github.com/schigurupatis/Team-Task-Hub.git
cd Team-Task-Hub

# Navigate to frontend and build
cd frontend
npm install
npm run build
```

## 3. Deploy to Nginx
Move the production files to the web server directory.


# Clear default Nginx files
sudo rm -rf /var/www/html/*

# Copy build files to web root
sudo cp -r dist/* /var/www/html/
```

## 4. Configure Nginx Routing
Essential for Single Page Applications (React/Vite) to handle page refreshes.

1. Open the config:
   
   sudo nano /etc/nginx/sites-available/default
   ```
2. Find the `location /` block and update the `try_files` line:
   ```nginx
   try_files \(uri\)uri/ /index.html;
   ```
3. Save (**Ctrl+O**, **Enter**) and Exit (**Ctrl+X**).

4. Restart Nginx:
   
   sudo systemctl restart nginx
   ```

## 5. Deployment Verification
The app should now be accessible at your EC2 Public IP:
**URL:** http://65.2.148.54/



#!/bin/bash

echo "Deploy to Render with Docker"
echo ""

# Step 1: Push to GitHub
echo "STEP 1: Initialize Git & Push to GitHub"
echo ""

if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit - ready for Render deployment"
    echo ""
    echo "Git initialized"
else
    echo "Git already initialized"
fi

echo ""
echo "TO PUSH TO GITHUB:"
echo "1. Create repo at https://github.com/new"
echo "2. Name it: bikecare"
echo "3. Run:"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR_USERNAME/bikecare.git"
echo "   git push -u origin main"
echo ""

# Step 2: Docker Hub (optional)
echo ""
echo "STEP 2: (OPTIONAL) Push Docker Image to Docker Hub"
echo "===================================================="
echo ""
echo "docker login"
echo "docker build -t YOUR_USERNAME/bikecare-backend:latest ./backend"
echo "docker push YOUR_USERNAME/bikecare-backend:latest"
echo ""

# Step 3: Deploy on Render
echo ""
echo "STEP 3: Deploy on Render"
echo "========================"
echo ""
echo "1. Go to https://render.com"
echo "2. Sign up with GitHub"
echo "3. New → Web Service"
echo "4. Connect your bikecare repo"
echo "5. Render will auto-detect render.yaml"
echo "6. Click Deploy!"
echo ""
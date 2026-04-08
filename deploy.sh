#!/bin/bash

echo "BikeCare - FREE Deployment Setup"

echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git not installed. Install from https://git-scm.com"
    exit 1
fi

echo "Git is installed"
echo ""

# Initialize git repo
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - BikeCare application"
    echo "Git repository created"
else
    echo "Git repository already exists"
fi

echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Create GitHub account at https://github.com/signup"
echo ""
echo "2. Create new repo at https://github.com/new"
echo "   Name it: bikecare"
echo ""
echo "3. Run these commands:"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR_USERNAME/bikecare.git"
echo "   git push -u origin main"
echo ""
echo "4. Deploy Backend (Render.com - FREE):"
echo "   - Sign up: https://render.com"
echo "   - New Web Service"
echo "   - Connect GitHub repo"
echo "   - See FREE_DEPLOYMENT.md for details"
echo ""
echo "5. Deploy Frontend (Netlify - FREE):"
echo "   - Sign up: https://netlify.com"
echo "   - Connect GitHub repo"
echo "   - See FREE_DEPLOYMENT.md for details"
echo ""

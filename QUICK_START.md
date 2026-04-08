# 🚀 BikeCare - Completely FREE Deployment Guide

## ⚡ Quick Start (5 minutes)

### 1️⃣ Create GitHub Account (FREE)
- Go to https://github.com/signup
- Create account
- Verify email

### 2️⃣ Push Your Code to GitHub

```bash
# Open PowerShell in your project directory
cd "E:\LUCKY\23002170410017_Dev Parmar"

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create NEW repository at https://github.com/new
# Name: bikecare

# Link to GitHub (replace YOUR_USERNAME)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bikecare.git
git push -u origin main
```

### 3️⃣ Deploy Backend on Render.com (FREE ✅)

**Sign up**: https://render.com (with GitHub)

**Create Web Service:**
```
- Select your GitHub repo
- Name: bikecare-backend
- Root: backend
- Build: pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
- Start: gunicorn bikecare.wsgi:application --bind 0.0.0.0:$PORT
- Plan: FREE
```

**Environment Variables:**
```
SECRET_KEY=any-random-string-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.onrender.com
```

**Your backend URL will be**: `https://bikecare-backend.onrender.com`

### 4️⃣ Deploy Frontend on Netlify (FREE ✅)

**Sign up**: https://netlify.com (with GitHub)

**Create Site:**
```
- Select your GitHub repo
- Base: frontend
- Build: npm run build
- Publish: build
```

**Set Environment Variable:**
```
REACT_APP_API_URL=https://bikecare-backend.onrender.com/api
```

**Your frontend URL will be**: `https://yourdomain.netlify.app`

### 5️⃣ Create Admin User

Go to Render dashboard → bikecare-backend → Shell

```bash
python manage.py createsuperuser
# Username: admin
# Email: admin@bikecare.com
# Password: admin123
```

---

## ✅ You're LIVE!

- **Frontend**: https://yourdomain.netlify.app
- **Admin Panel**: Log in with admin / admin123
- **Backend API**: https://bikecare-backend.onrender.com/api

---

## 💰 COSTS (Completely FREE!)

| Service | Cost | Limits |
|---------|------|--------|
| **Render Backend** | FREE | Sleeps after 15 min |
| **Netlify Frontend** | FREE | Unlimited |
| **Database** | FREE for 90 days | Then $7/month (optional) |
| **TOTAL** | **🎉 FREE** | No credit card needed |

⚠️ After 90 days, database costs $7/month. You can:
1. Keep using for free (limited)
2. Upgrade ($7/month)
3. Use SQLite (resets on deploy)
4. Switch to Railway ($5/month all-in)

---

## 🔧 Troubleshooting

**"502 Bad Gateway"** on Render
- Check Logs in Render dashboard
- Run: `python manage.py migrate`

**Frontend can't reach API**
- Update `REACT_APP_API_URL` in Netlify
- Check `CORS_ALLOWED_ORIGINS` in Django

**Database issues**
- Render PostgreSQL is automatic
- No manual setup needed

---

## 📚 Full Docs

See **FREE_DEPLOYMENT.md** for detailed instructions.

---

**Questions? Check the logs and error messages first!**

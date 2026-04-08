# BikeCare - Completely FREE Deployment

## FREE TIER SETUP

### Backend: Render.com (FREE - but sleeps after 15 min inactivity)
### Frontend: Netlify (FREE)
### Database: Render PostgreSQL (FREE - 90 day trial, then $7/month)

---

## STEP 1: Push Code to GitHub

```bash
cd E:\LUCKY\23002170410017_Dev Parmar

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create NEW GitHub repo at https://github.com/new
# Name it: bikecare

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bikecare.git
git push -u origin main
```

---

## STEP 2: Deploy Backend on Render (FREE)

1. **Go to https://render.com**
2. **Sign up with GitHub** (authorize connection)
3. **Create new Web Service**
   - Select your GitHub repo: `bikecare`
   - Name: `bikecare-backend`
   - Environment: `Python 3.11`
   - Root Directory: `backend`
   - Build Command:
     ```
     pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
     ```
   - Start Command:
     ```
     gunicorn bikecare.wsgi:application --bind 0.0.0.0:$PORT
     ```
   - Plan: **FREE**

4. **Add Environment Variables** (Settings → Environment)
   ```
   SECRET_KEY=your-random-secret-key-12345
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.onrender.com
   DATABASE_URL=(auto-set by Render PostgreSQL)
   ```

5. **Create Free PostgreSQL Database** on Render
   - New → PostgreSQL
   - Name: `bikecare-db`
   - Region: Same as backend
   - Plan: FREE (90 days, then $7/month)
   - Copy DATABASE_URL → paste in backend env vars

6. **Deploy!** (automatic)
   - URL will be: `https://bikecare-backend.onrender.com`

---

## STEP 3: Deploy Frontend on Netlify (COMPLETELY FREE)

1. **Go to https://netlify.com**
2. **Sign up with GitHub**
3. **Deploy Site**
   - Select repo: `bikecare`
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`
   - Deploy!

4. **Update API URL**
   - In `frontend/src/services/api.js`, change:
   ```javascript
   const API_BASE_URL = 'https://bikecare-backend.onrender.com/api';
   ```
   - Or use environment variable:
   ```javascript
   const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
   ```

5. **Add Environment Variable in Netlify**
   - Site settings → Build & deploy → Environment
   - `REACT_APP_API_URL=https://bikecare-backend.onrender.com/api`

---

## STEP 4: Create Admin User on Production

```bash
# Via Render dashboard:
# Settings → Shell → Run
# OR use Render CLI

# Connect to Render shell:
render-cli shell bikecare-backend

# Run:
python manage.py createsuperuser
# Username: admin
# Email: admin@bikecare.com
# Password: admin123
```

---

## STEP 5: Update CORS on Production

Edit `backend/bikecare/settings_prod.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.netlify.app",
    "https://yourdomain.onrender.com",
    "http://localhost:3000",
]
```

Then push to GitHub - automatic redeploy!

---

## FINAL URLS

- **Frontend**: https://yourdomain.netlify.app
- **Backend**: https://bikecare-backend.onrender.com
- **Admin Panel**: https://yourdomain.netlify.app/admin (after login)
- **Django Admin**: https://bikecare-backend.onrender.com/admin

---

## PRICING (Completely FREE)

| Service | Cost | Limits |
|---------|------|--------|
| Render Backend | FREE | Sleeps after 15 min inactivity |
| Netlify Frontend | FREE | Unlimited |
| Render PostgreSQL | FREE for 90 days | Then $7/month |
| **TOTAL** | **FREE** | ⚠️ Database paid after trial |

### After 90 days:
- Keep Render (FREE but slow)
- OR upgrade database only ($7/month)
- OR switch to Railway ($5/month for everything)

---

## COMPLETELY FREE (No paid tier ever)

Use **SQLite** instead of PostgreSQL:
1. Render free tier includes file storage
2. Configure settings to save DB in `/tmp` (ephemeral)
3. Database resets on redeploy (not ideal but free!)

---

## TROUBLESHOOTING

### "502 Bad Gateway" on Render
- Check logs: Render dashboard → Logs
- Run migrations: `python manage.py migrate`
- Restart service

### Frontend can't reach backend
- CORS error? Update `CORS_ALLOWED_ORIGINS`
- Check API URL in `api.js`
- Check backend is running

### Database connection error
- Verify `DATABASE_URL` is set
- Check PostgreSQL is running
- Run migrations

---

## NEXT STEPS

1. Create GitHub account (free)
2. Push code to GitHub
3. Sign up Render.com (free, no credit card)
4. Sign up Netlify (free, no credit card)
5. Connect repos
6. Deploy!

**Total setup time: ~15 minutes**

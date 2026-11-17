# Sri Lakshmi Ganapathi - Areca Leaf Plates Manufacturers (Eluru)

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-green.svg)](https://flask.palletsprojects.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-CDN-38B2AC.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://web.dev/progressive-web-apps/)
[![Status](https://img.shields.io/badge/Deployment-24%2F7%20Ready-success.svg)](#247-cloud-deployment-guide)

A modern, mobile-first e-commerce web application and Progressive Web App (PWA) for **Sri Lakshmi Ganapathi - Areca Plates Manufacturers**, located in **Eluru, Andhra Pradesh**.

> **"Sustainable. Natural. Pure."**  
> 100% natural, biodegradable, chemical-free dinnerware handcrafted from naturally fallen areca palm leaves.

---

## 🏭 Factory & Business Information

- **Manufacturer**: Sri Lakshmi Ganapathi Areca Plates Manufacturers
- **Factory Unit**: `8-176, Block 3, Sunkaravaari Thota, Madhepalli Road, Eluru, Andhra Pradesh - 534001`
- **Owner**: Anand Majji (`9642677869`)
- **Factory Dispatch**: `9849052800`
- **Official UPI ID**: `anandmajji141@axl`
- **Delivery**: Fast doorstep delivery across Eluru city & nearby mandals within 2-4 hours.

---

## 🚀 Key Features

1. **Zomato / Blinkit Style Mobile-First Interface**:
   - Modern sticky top bar with real-time search, category navigation, and cart pill.
   - Mobile bottom navigation bar (Home, Shop, Cart, Wishlist, Orders, Account/Owner).
   - Instant pack size selectors (25 pcs base pack, 50 pcs, 100 pcs bulk savings).
   - Bilingual support: **English** and **తెలుగు (Telugu)**.

2. **Safe Doorstep Delivery with GPS Pinpoint**:
   - Mandatory delivery address prompt at checkout (Door number, Street, Eluru Locality dropdown, Landmark, Pincode).
   - One-click **"📍 Use Current Location"** button auto-pinpoints exact GPS coordinates (`lat`, `lng`).
   - Safe delivery preferences (Call before arriving, Leave at doorstep, Leave with watchman, etc.).

3. **Live Real-Time Order Tracking**:
   - 5-stage Flipkart/Blinkit milestone tracker (`Placed` ➔ `Confirmed` ➔ `Packed` ➔ `Out for Delivery` ➔ `Delivered`).
   - Real-time automatic background polling (every 3.5s) reflects status updates instantly with glowing pulse animations.
   - Printable Tax Invoice / Packing Slip generator.

4. **24/7 AI Smart Support Assistant**:
   - Floating AI chat assistant powered by full knowledge base of Eluru factory products, plate sizes, wedding catering calculations, and real-time order tracking.

5. **Owner Control Panel**:
   - **Credentials**: Username `AnandMajji`, Password `@n@nd@123`
   - Real-time business metrics (Today's orders, revenue, pending deliveries).
   - Live order dispatch status manager with WhatsApp customer messaging.
   - Products & pricing management, festival coupon generator, and CSV exports.

---

## 🌐 24/7 Cloud Deployment Guide (Zero Sleep / No Shutdown)

To run this application 24/7 continuously so customers and the owner can access it at any time without server sleeping or delays:

### Option 1: Koyeb (Recommended - 100% Free & Never Sleeps)
1. Sign up for free at [koyeb.com](https://www.koyeb.com/).
2. Click **Create App** ➔ Select **GitHub**.
3. Select this repository.
4. Koyeb automatically detects the `Dockerfile` or `requirements.txt` and `Procfile`.
5. Set port to `8000`.
6. Click **Deploy**! Your app will be live 24/7 with an SSL domain (e.g. `https://<your-app>.koyeb.app`). Koyeb free Eco tier does **not** sleep!

### Option 2: Railway
1. Sign up at [railway.app](https://railway.app/).
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Select this repository.
4. Railway automatically builds and deploys your app with 24/7 continuous uptime and persistent storage.

### Option 3: Render (Free with 24/7 Keep-Alive Ping)
1. Sign up at [render.com](https://render.com/).
2. Click **New +** ➔ **Web Service** ➔ Connect your GitHub repository.
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. Deploy the service.
5. **To prevent Render free tier from sleeping after 15 minutes**:
   - Go to [cron-job.org](https://cron-job.org) or [uptimerobot.com](https://uptimerobot.com) (both 100% free).
   - Add a monitor pinging your live URL every 5 minutes: `https://<your-render-app>.onrender.com/api/settings`.
   - This keeps your application awake 24 hours a day, 365 days a year without cost!

---

## 💻 Local Development Setup

```bash
# 1. Clone repository
git clone <your-repo-url>
cd sri-lakshmi-ganapathi

# 2. Install dependencies
pip install -r requirements.txt

# 3. Initialize database (if running fresh)
python init_db.py

# 4. Start local development server
python app.py
```

Visit `http://localhost:8000` in your browser.

---

## 📄 License
Sri Lakshmi Ganapathi Areca Plates Manufacturers © 2026. All rights reserved.

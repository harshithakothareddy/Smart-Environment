# 🍃 MongoDB Database Integration Guide for EcoPulse India

This project is now fully configured with **MongoDB & Mongoose**. Follow the simple steps below to connect your real database.

---

## 1. Quick Setup (MongoDB Atlas — Cloud Cluster)

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create or select your cluster.
3. Under **Database Access**, ensure you have created a database user (e.g., `admin`) and noted the password.
4. Under **Network Access**, ensure IP `0.0.0.0/0` (Allow Access from Anywhere) or your current IP is added.
5. Click **Connect** → **Drivers** (Node.js) and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/econexus?retryWrites=true&w=majority
   ```
6. Open [`backend/.env`](file:///c:/Users/harsh/Downloads/Eco-nexus-main/Eco-nexus-main/backend/.env) and paste your connection string:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/econexus?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your real credentials)*.

---

## 2. Seed Initial Database Data

Once you have added your connection string to `.env`, run the seed script to automatically populate your database with initial Indian cities, real reports, alerts, states, and products:

```bash
cd backend
npm run seed
```

You should see:
```text
✅ Connected to MongoDB. Seeding collections...
✅ Seeded 5 citizen reports.
✅ Seeded 3 environmental alerts.
✅ Seeded 18 cities.
✅ Seeded 9 states.
✅ Seeded 4 products.
🎉 Database seeding completed successfully!
```

---

## 3. Starting the Backend Server

```bash
cd backend
npm start
# or for auto-reload during development:
npm run dev
```

When connected to your real database, the terminal will show:
```text
🚀 EcoPulse Backend Server running on port 5000
📡 API Endpoints available at http://localhost:5000/api
✅ MongoDB Connected successfully: cluster0... / DB: econexus
```

---

## 4. Local MongoDB (Alternative)

If you have a local MongoDB server installed on Windows:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/econexus
```

---

## 5. Available MongoDB Collections & Endpoints

| Collection | Schema Model | Endpoints |
|---|---|---|
| **Reports** | `models/Report.js` | `GET /api/reports`, `POST /api/reports`, `PATCH /api/reports/:id/upvote`, `PATCH /api/reports/:id/status`, `DELETE /api/reports/:id` |
| **Alerts** | `models/Alert.js` | `GET /api/alerts`, `POST /api/alerts`, `PATCH /api/alerts/:id/toggle`, `DELETE /api/alerts/:id` |
| **Cities** | `models/City.js` | `GET /api/cities`, `GET /api/air/city/:cityName`, `GET /api/air/ranking` |
| **States** | `models/State.js` | `GET /api/states`, `GET /api/states/:stateName`, `GET /api/ranking/overall` |
| **Products** | `models/Product.js` | `GET /api/products`, `GET /api/products/:id` |
| **Health Check** | — | `GET /api/health` (Reports live database status & connection state) |

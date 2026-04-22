# 🚀 PrismVideo Deployment Guide (Render + Vercel)

Follow these steps to deploy your professional meeting application.

## 1. Backend (Render)
- **Automatic Deployment**: I have added a `render.yaml` file to the root. In Render, select **Blueprints** and connect your repo. It will automatically configure the Backend.
- **Manual Setup (If not using Blueprints)**:
    - **Root Directory**: `Backend`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
- **Environment Variables**:
    - `MONGO_URL`: Your MongoDB Atlas connection string (Set this manually in Render Dashboard).
    - `PORT`: `8000` (Handled by `render.yaml`).
    - `NODE_VERSION`: `20.10.0` (Handled by `render.yaml`).

## 2. Frontend (Vercel)
- **Repo**: Connect your GitHub repository.
- **Root Directory**: `frontend`
- **Framework Preset**: `Create React App`
- **Environment Variables**:
    - `REACT_APP_BACKEND_URL`: The URL provided by Render (e.g., `https://your-app.onrender.com`).

## 3. Essential Security Step
Once you have your Vercel URL (e.g., `https://prism-video.vercel.app`), go back to your Backend code in `app.js` or update the environment variable on Render to allow that specific URL in CORS.

## Troubleshooting
- **Camera/Mic not working**: Ensure you are using `https://`. Browser security blocks media on `http://`.
- **404 on Refresh**: I have already added `vercel.json` to handle this.
- **Socket Connection Error**: Ensure `REACT_APP_BACKEND_URL` is set correctly in Vercel.

---
**PrismVideo** | Professional Meeting Suite

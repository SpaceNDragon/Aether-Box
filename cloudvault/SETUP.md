# CloudVault - Setup Guide

## Quick Start

### Prerequisites
1. **Node.js** installed (version 18+)
2. **MongoDB Atlas** account (free)
3. **Cloudinary** account with API key

---

## Step 1: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster (选择免费的 M0 Sandbox)
4. Create a database user (用户名和密码)
5. 在 Network Access 中添加 IP: `0.0.0.0/0`
6. 点击 "Connect" 获取连接字符串:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/cloudvault?retryWrites=true&w=majority
   ```

---

## Step 2: Cloudinary Setup

1. Go to https://cloudinary.com
2. Create a free account
3. 在 Dashboard 中找到:
   - Cloud Name
   - API Key
   - API Secret

---

## Step 3: Configure Backend

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://你的用户名:你的密码@cluster.mongodb.net/cloudvault?retryWrites=true&w=majority
JWT_SECRET=any_secure_string_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=你的cloud_name
CLOUDINARY_API_KEY=你的api_key
CLOUDINARY_API_SECRET=你的api_secret
```

---

## Step 4: Run the Project

### Terminal 1 - Backend:
```bash
cd cloudvault/backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd cloudvault/frontend
npm run dev
```

---

## Step 5: Open Browser

Go to: http://localhost:5173

---

## Features Implemented

- User registration & login (JWT auth)
- Drag & drop file upload to Cloudinary
- Folder creation & navigation
- File preview (images, videos, audio, PDFs)
- File sharing with link generation
- Dark/Light theme toggle
- Storage usage tracking
- Search files & folders

---

## Design

Apple-inspired UI with:
- Inter font
- Blue accent (#0071E3)
- Glass effect (backdrop blur)
- Smooth animations
- Responsive design
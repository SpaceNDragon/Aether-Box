# CloudVault - Online File Management System

A modern, Apple-inspired file management system built with React, Node.js, and Cloudinary.

## Features

- **User Authentication** - Secure login/registration with JWT
- **File Upload** - Drag & drop multiple file uploads
- **Folder Organization** - Create, rename, delete folders with nested structure
- **File Preview** - Preview images, videos, audio, and PDFs inline
- **File Sharing** - Generate shareable links with expiration
- **Search** - Search files and folders by name
- **Dark/Light Mode** - Toggle between themes
- **Storage Management** - Track storage usage
- **Responsive Design** - Works on desktop and mobile
- **Bulk Operations** - Select and delete multiple files
- **Sorting** - Sort files by name, size, or date

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- React Router DOM
- React Dropzone
- Lucide React (icons)

### Backend
- Node.js + Express
- SQLite (local database - no setup needed)
- Cloudinary (file storage)
- JWT (authentication)
- Multer (file handling)

## Prerequisites

- Node.js 18+
- Cloudinary account (with API key)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Update `.env` with your Cloudinary credentials:

```env
PORT=5000
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

## Deployment

### Frontend - Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com
3. "Add New..." → "Project"
4. Import your repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variable: `VITE_API_URL` = your backend URL
7. Deploy!

### Backend - Railway (Recommended)

1. Push your code to GitHub
2. Go to https://railway.app
3. "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add Environment Variables:
   - `PORT` = 5000
   - `JWT_SECRET` = your secret
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your key
   - `CLOUDINARY_API_SECRET` = your secret
6. Deploy!

### Backend - Render

1. Push your code to GitHub
2. Go to https://render.com
3. "New" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. Add Environment Variables (same as Railway)
7. Deploy!

## Project Structure

```
cloudvault/
├── backend/
│   ├── config/          # Database config (SQLite)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & upload middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── server.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Auth & Theme contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service
│   │   └── utils/       # Utility functions
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/avatar` - Upload avatar

### Files
- `GET /api/files` - Get user's files
- `POST /api/files/upload` - Upload file
- `POST /api/files/upload-multiple` - Upload multiple files
- `DELETE /api/files/:id` - Delete file
- `DELETE /api/files/bulk` - Delete multiple files
- `POST /api/files/:id/share` - Generate share link
- `GET /api/files/shared/:token` - Access shared file

### Folders
- `GET /api/folders` - Get user's folders
- `POST /api/folders` - Create folder
- `PUT /api/folders/:id` - Rename folder
- `DELETE /api/folders/:id` - Delete folder

### Search
- `GET /api/search?q=query` - Search files and folders

## Design System

The UI follows Apple Human Interface Guidelines:

- **Typography**: Inter font with SF Pro fallback
- **Colors**: Neutral palette with blue accent (#0071E3)
- **Spacing**: 8px grid system
- **Border Radius**: 8-24px smooth corners
- **Shadows**: Subtle, layered shadows
- **Glass Effect**: Backdrop blur for overlays
- **Animations**: Smooth 150-350ms transitions

## License

MIT License
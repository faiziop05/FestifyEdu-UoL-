# FestifyEdu

Welcome to the **FestifyEdu** project! This is a comprehensive, interactive learning platform that allows teachers to create data-driven quizzes using datasets, host live sessions, and track student performance. The system features a robust role-based access control system with Super Admin, Admin, Teacher, and Student roles.

## 🌐 Live Demo

You can view and interact with the live deployed website here:
**[FestifyEdu Live Site](https://frontend-pink-rho-s0gl23uxb5.vercel.app/)**

---

## 🔑 Demo Credentials

You can use the following credentials to explore the different roles and access levels within the application:

| Role            | Email                       | Password      | Access Level                                                                                  |
| --------------- | --------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| **Super Admin** | `superadmin@festifyedu.com` | `password123` | Highest level. Manage all organizations, global datasets, and system admins.                  |
| **Admin**       | `faizan@lutonschools.com`   | `123456`      | Manage teachers and share quizzes/datasets within a specific organization (Luton Schools).    |
| **Teacher**     | `ali@lutonschools.com`      | `123456`      | Create interactive quizzes, upload datasets, start live sessions, and monitor student grades. |
| **Student**     | _(No Account Required)_     | _(N/A)_       | Students join active sessions using a 6-digit room code provided by a Teacher.                |

---

## 📁 Folder Structure

The repository is split into two main directories:

```text
fh190/
│
├── backend/               # Node.js + Express Backend Server
│   ├── src/
│   │   ├── config/        # Database and server configuration
│   │   ├── controllers/   # Route handlers mapped by role (superAdmin, admin, teacher, global)
│   │   ├── middlewares/   # Authentication and Role validation middleware
│   │   ├── models/        # Mongoose database schemas (Users, Classrooms, Quizzes, Datasets, etc.)
│   │   ├── routes/        # Express API routes
│   │   └── cron/          # Background cron jobs (e.g., stale session cleanup)
│   ├── index.js           # Server entry point
│   ├── seed.js            # Database seeding script for initial setup
│   └── package.json       # Backend dependencies and scripts
│
├── frontend/              # React (Vite) Frontend Application
│   ├── src/
│   │   ├── components/    # Reusable UI components (Header, Navigation, QuizBuilder, Modals)
│   │   ├── pages/         # Page views organized by role (superadmin, admin, teacher, student, globel)
│   │   ├── redux/         # Redux state management (Auth, API slices)
│   │   ├── styles/        # CSS Modules for styling components and pages
│   │   ├── hooks/         # Custom React hooks (e.g., useThemeObserver)
│   │   └── App.jsx        # Main application routing and protected routes layout
│   ├── index.html         # Frontend entry point
│   └── package.json       # Frontend dependencies and scripts
│
└── README.md              # Project documentation
```

texttext---

## 🚀 Step-by-Step Installation Instructions

To run this project locally on your machine, follow these steps:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine. You will also need access to a MongoDB database (either local or MongoDB Atlas).

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd fh190
```

bashbash### 2. Set up the Backend

Open a new terminal window and navigate to the backend folder:

```bash
cd backend
```

bashbash**Install dependencies:**

```bash
npm install
```

bashbash**Configure Environment Variables:**
Create a `.env` file in the `backend/` directory with the following keys. Below are detailed instructions on how to obtain each value:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5001/api/drive/callback
```

env#### How to configure your `.env` file:

**1. `PORT`:**
The port your backend will run on. Default is `5001`.

**2. `MONGO_URI` (MongoDB Connection):**

- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
- Create a new Cluster and a Database User. Ensure you allow network access from anywhere (`0.0.0.0/0`) or your specific IP.
- Click **Connect** -> **Drivers** and copy the connection string.
- Replace `<password>` with your Database User's password.

**3. `JWT_SECRET` (Authentication Token Security):**

- This is used to sign JSON Web Tokens for user login sessions.
- You can use any long, random string. To generate a secure one easily, you can run the following in your terminal: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Paste the output as your `JWT_SECRET`.

**4. Google Drive API Credentials (`GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`):**
FestifyEdu integrates with Google Drive so teachers can import datasets directly from their cloud storage. To make this work, you need Google Cloud API credentials:

- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- Create a New Project (e.g., "FestifyEdu App").
- Go to **APIs & Services** > **Library** and search for **Google Drive API**. Click **Enable**.
- Go to **APIs & Services** > **OAuth consent screen**. Choose **External** and fill in the required fields (App name, support email, developer contact email). Save and continue.
- Go to **APIs & Services** > **Credentials**.
- Click **Create Credentials** > **OAuth client ID**.
- Select **Web application** as the Application Type.
- Under **Authorized redirect URIs**, click "Add URI" and paste your redirect URL exactly as it is in the `.env`: `http://localhost:5001/api/drive/callback` (If you deploy the app, you will need to add the deployed backend URL here too).
- Click **Create**. You will be presented with your **Client ID** and **Client Secret**. Copy these into your `.env` file!

**5. `GOOGLE_REDIRECT_URI`:**

- Set this to `http://localhost:5001/api/drive/callback` for local development. Make sure it matches the Authorized Redirect URI you entered in the Google Cloud Console exactly.

**Seed the Database (Optional but recommended):**
If you are setting up the database for the very first time, you need an initial Super Admin account to log in and create other organizations and teachers. To automatically generate this default user and an initial organization, run the seed script:

```bash
node seed.js
```

bashRunning this script will create a new organization called "FestifyEdu Central" and provide you with the following login credentials:

- **Email:** `superadmin@festifyedu.com`
- **Password:** `password123`

You can use these credentials to log in at `http://localhost:5173/auth/login` once the frontend is running.

bash**Start the Backend Server:**

```bash
npm run dev
# OR
npm start
```

bashbash*The backend should now be running on `http://localhost:5001`.*

### 3. Set up the Frontend

Open a second terminal window and navigate to the frontend folder from the root of the project:

```bash
cd frontend
```

bashbash**Install dependencies:**

```bash
npm install
```

bashbash**Configure Environment Variables:**
Create a `.env` file in the `frontend/` directory (if required by your setup) to define the backend API URL. By default, it will attempt to connect to localhost port 5001.

```env
VITE_API_URL=http://localhost:5001/api
```

envenv**Start the Frontend Development Server:**

```bash
npm run dev
```

bashbash*The frontend should now be running on `http://localhost:5173`. Open this URL in your browser to view the application.*

---

## 🛠️ Built With

- **Frontend:** React, Vite, Redux Toolkit, React Router DOM, Chart.js, Lucide React
- **Backend:** Node.js, Express.js, Socket.IO, Mongoose
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs

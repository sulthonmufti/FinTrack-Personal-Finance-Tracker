# FinTrack - Personal Finance Tracker

<div align="center">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js" />
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
</div>

FinTrack is a full-stack personal finance tracking application designed to help users manage daily transactions and expense categories efficiently. The project is built with a modern architecture using Node.js on the Backend and React (Vite) on the Frontend, featuring JWT-based authentication and a modular MVC-ish folder structure.

---

## Key Features

- **User Authentication:** Register, Login, and Logout with JWT-based session management.
- **Account Settings:** Edit profile information (username & email) and change password with a tabbed UI.
- **Transaction Management:** Record and view financial transaction history per user.
- **Categorization:** Group transactions by categories (e.g., Food, Transport, Entertainment).
- **Interactive Dashboard:** Visualize data with dynamic charts using Recharts.
- **Multi-page Navigation:** Smooth routing with protected routes via React Router DOM.
- **Relational Database:** Structured data storage using PostgreSQL with user-scoped data.
- **RESTful API:** Modular route-based API architecture with middleware authentication.

---

## Tech Stack

| Category       | Technology                                |
| :------------- | :---------------------------------------- |
| Frontend       | React.js (Vite), Tailwind CSS 4.0        |
| Navigation     | React Router DOM                          |
| Charts         | Recharts                                  |
| Icons          | Lucide React                              |
| HTTP Client    | Axios                                     |
| Backend        | Node.js, Express.js                       |
| Authentication | JSON Web Token (JWT), Bcrypt              |
| Database       | PostgreSQL                                |
| Environment    | Dotenv, CORS                              |
| API Testing    | Postman / Insomnia                        |

---

## Project Structure

```text
FinTrack/
├── backend-fintrack/           # Server-side (Express & Node.js)
│   ├── config/
│   │   └── db.js               # PostgreSQL pool connection configuration
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT token verification middleware
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints (register, login, update-profile, change-password)
│   │   └── transactionRoutes.js # Transaction & category CRUD endpoints
│   ├── .env                    # Environment variables (Hidden/Ignored)
│   ├── index.js                # Main entry point & route mounting
│   └── package.json            # Backend dependencies
│
├── frontend-fintrack/          # Client-side (React & Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images & SVG assets (hero.png, etc.)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ProfileHeader.jsx     # User profile display in header
│   │   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   │   ├── StatsGrid.jsx         # Financial statistics cards
│   │   │   ├── TransactionModal.jsx  # Add transaction modal form
│   │   │   └── TransactionTable.jsx  # Transaction list table
│   │   ├── pages/              # Page-level components (routed views)
│   │   │   ├── Dashboard.jsx         # Main dashboard with charts
│   │   │   ├── EditProfile.jsx       # Account settings (profile info & password)
│   │   │   ├── Login.jsx             # Login & registration page
│   │   │   └── Wallets.jsx           # Transaction management page
│   │   ├── utils/
│   │   │   └── formatters.js         # Currency & date formatting helpers
│   │   ├── App.jsx             # Root component with routing & auth guard
│   │   ├── App.css             # Global application styles
│   │   ├── index.css           # Tailwind CSS entry point
│   │   └── main.jsx            # React DOM entry point
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite build configuration
│   └── package.json            # Frontend dependencies
│
├── .gitignore                  # Git ignore configuration
└── README.md                   # Project documentation
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint              | Auth | Description                    |
| :----- | :-------------------- | :--- | :----------------------------- |
| POST   | `/api/auth/register`  | No   | Register a new user            |
| POST   | `/api/auth/login`     | No   | Login and receive JWT token    |
| PUT    | `/api/auth/update-profile` | Yes | Update username and email |
| PUT    | `/api/auth/change-password` | Yes | Change user password      |

### Transactions (`/api/transactions`)

| Method | Endpoint                       | Auth | Description                     |
| :----- | :----------------------------- | :--- | :------------------------------ |
| GET    | `/api/transactions`            | Yes  | Get all transactions for user   |
| POST   | `/api/transactions`            | Yes  | Create a new transaction        |
| GET    | `/api/transactions/categories` | No   | Get all categories for dropdown |

---

## Database Schema

The application uses three main tables. Below is the SQL script to initialize the database structure:

```sql
-- 1. Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 2. Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(10) DEFAULT 'expense'
);

-- 3. Create transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Initial Data (Optional)
INSERT INTO categories (name, type) VALUES
  ('Food', 'expense'),
  ('Transport', 'expense'),
  ('Utilities', 'expense'),
  ('Entertainment', 'expense');
```

---

## Installation & Setup

### 1. Prerequisites

- Node.js (LTS version recommended)
- PostgreSQL (Local installation or Docker container)

### 2. Database Configuration

Create a `.env` file in the `backend-fintrack/` directory and provide your credentials:

```env
DB_USER=your_username
DB_HOST=localhost
DB_DATABASE=fintrack_db
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
```

### 3. Accessing PostgreSQL via Terminal

To access and manage the database directly from your terminal (using Docker), execute:

```bash
docker exec -it postgres-dev psql -U postgres
```

#### Helpful PostgreSQL Commands:

Once you are inside the PostgreSQL terminal (`psql`), you can use these shortcuts:

- **General Commands:**
  - `\l` : List all databases.
  - `\c fintrack_db` : Connect to the `fintrack_db` database.
  - `\q` : Quit/Exit the psql terminal.

- **Viewing Tables:**
  - `\dt` : List tables in the current database.
  - `\dt *.*` : List all tables in all schemas.
  - `\d table_name` : Show structure (columns, types) of a specific table.

- **Common SQL Queries:**
  - `SELECT * FROM users;` : View all registered users.
  - `SELECT * FROM categories;` : View all categories.
  - `SELECT * FROM transactions;` : View all transactions.
  - `DELETE FROM transactions WHERE id = 1;` : Delete a specific transaction.

### 4. Setup Backend

```bash
cd backend-fintrack
npm install
node index.js
```

The server will start at `http://localhost:5000`.

### 5. Setup Frontend

```bash
cd frontend-fintrack
npm install
npm run dev
```

The application will be accessible at the local address provided in the terminal (usually `http://localhost:5173`).

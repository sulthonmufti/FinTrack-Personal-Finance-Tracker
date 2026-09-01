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

FinTrack is a full-stack personal finance tracking application designed to help users manage daily transactions, digital wallets, and expense categories efficiently. The project is built with a modern architecture using Node.js on the Backend and React (Vite) on the Frontend, featuring JWT-based authentication, wallet balance synchronization, and a modular MVC-ish folder structure.

---

## Key Features

- **User Authentication:** Register (with auto-login & default categories), Login, and Logout with JWT-based session management (24h expiry).
- **Wallet Management:** Full CRUD for digital wallets — add wallets with initial balance (auto-creates income transaction), edit details (name, account number, card theme), and delete with confirmation.
- **Transaction Management:** Full CRUD — add, edit, and delete financial transactions with automatic wallet balance synchronization using PostgreSQL database transactions (`BEGIN`/`COMMIT`/`ROLLBACK`).
- **Categorization:** User-scoped categories (income & expense types) with custom category creation via Settings page. Default categories ("Gaji", "Makanan") are auto-generated on registration.
- **Interactive Dashboard:** Visualize data with dynamic Pie Charts (switchable expense/income mode), Area Charts for trends, financial statistics cards, month-over-month comparison percentages, and a hide/show balance toggle.
- **Advanced Filtering:** Global month & year filter on Dashboard, and search + category + month + year filters with pagination (10 items/page) on Transactions page.
- **Settings Hub:** Tabbed interface for Profile editing, Password change (with old password verification), and Category management (add new categories with type selection).
- **Multi-page Navigation:** Smooth routing with protected routes via React Router DOM, responsive sidebar with mobile hamburger menu support.
- **Relational Database:** Structured data storage using PostgreSQL with user-scoped data and foreign key relationships.
- **RESTful API:** Modular route-based API architecture with middleware authentication and database transaction protection for data integrity.

---

## Tech Stack

| Category       | Technology                                |
| :------------- | :---------------------------------------- |
| Frontend       | React.js 19 (Vite 8), Tailwind CSS 4.0   |
| Navigation     | React Router DOM 7                        |
| Charts         | Recharts 3                                |
| Icons          | Lucide React, React Icons (HiOutline)     |
| HTTP Client    | Axios                                     |
| Backend        | Node.js, Express.js 5                     |
| Authentication | JSON Web Token (JWT), Bcrypt              |
| Database       | PostgreSQL (pg 8)                         |
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
│   │   ├── transactionRoutes.js # Transaction & category CRUD endpoints (with wallet sync)
│   │   └── walletRoutes.js     # Wallet CRUD endpoints (with initial balance transaction)
│   ├── .env                    # Environment variables (Hidden/Ignored)
│   ├── index.js                # Main entry point & route mounting
│   └── package.json            # Backend dependencies
│
├── frontend-fintrack/          # Client-side (React & Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images & SVG assets (hero.png, etc.)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── DeleteConfirmModal.jsx  # Delete confirmation dialog with warning UI
│   │   │   ├── ProfileHeader.jsx       # User profile display in header
│   │   │   ├── Sidebar.jsx             # Navigation sidebar (Dashboard, Wallets, Transactions, Reports, Settings)
│   │   │   ├── StatsGrid.jsx           # Financial statistics cards & chart widgets
│   │   │   ├── TransactionModal.jsx    # Add/edit transaction modal form (with wallet & category selection)
│   │   │   ├── TransactionTable.jsx    # Transaction list table with pagination
│   │   │   ├── WalletCard.jsx          # Individual wallet card component (with theme colors)
│   │   │   └── WalletModal.jsx         # Add/edit wallet modal form (with card theme picker)
│   │   ├── pages/              # Page-level components (routed views)
│   │   │   ├── Dashboard.jsx         # Main dashboard with charts, stats & global date filter
│   │   │   ├── EditProfile.jsx       # Legacy profile edit page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Register.jsx          # Registration page with success modal & auto-login
│   │   │   ├── Settings.jsx          # Settings hub (Profile, Security, Categories tabs)
│   │   │   ├── Transactions.jsx      # Full transaction management with search, filter & pagination
│   │   │   └── Wallets.jsx           # Wallet management page with card grid layout
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

| Method | Endpoint                      | Auth | Description                                    |
| :----- | :---------------------------- | :--- | :--------------------------------------------- |
| POST   | `/api/auth/register`          | No   | Register new user (auto-creates default categories & returns JWT) |
| POST   | `/api/auth/login`             | No   | Login and receive JWT token                    |
| PUT    | `/api/auth/update-profile`    | Yes  | Update username and email                      |
| PUT    | `/api/auth/change-password`   | Yes  | Change password (requires old password verification) |

### Transactions (`/api/transactions`)

| Method | Endpoint                       | Auth | Description                                        |
| :----- | :----------------------------- | :--- | :------------------------------------------------- |
| GET    | `/api/transactions`            | Yes  | Get all transactions (supports `?month=` & `?year=` query filters) |
| POST   | `/api/transactions`            | Yes  | Create transaction (auto-syncs wallet balance via DB transaction) |
| PUT    | `/api/transactions/:id`        | Yes  | Edit transaction (cross-wallet balance adjustment via DB transaction) |
| DELETE | `/api/transactions/:id`        | Yes  | Delete transaction (auto-reverses wallet balance via DB transaction) |
| GET    | `/api/transactions/categories` | Yes  | Get all user-scoped categories                     |
| POST   | `/api/transactions/categories` | Yes  | Create a new custom category                       |

### Wallets (`/api/wallets`)

| Method | Endpoint              | Auth | Description                                        |
| :----- | :-------------------- | :--- | :------------------------------------------------- |
| GET    | `/api/wallets`        | Yes  | Get all wallets for the authenticated user         |
| POST   | `/api/wallets`        | Yes  | Create wallet (auto-creates initial balance transaction via DB transaction) |
| PUT    | `/api/wallets/:id`    | Yes  | Update wallet details (name, account number, card theme) |
| DELETE | `/api/wallets/:id`    | Yes  | Delete a wallet                                    |

---

## Database Schema

The application uses four main tables. Below is the SQL script to initialize the database structure:

```sql
-- 1. Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 2. Create categories table (user-scoped)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) DEFAULT 'expense',
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create wallets table
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50),
    balance DECIMAL(15,2) DEFAULT 0,
    color VARCHAR(100) DEFAULT 'indigo',
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create transactions table (linked to categories & wallets)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    wallet_id INT REFERENCES wallets(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);
```

> **Note:** Default categories ("Gaji" as income, "Makanan" as expense) are automatically created per user during registration via the backend API. No manual seeding is required.

---

## Application Pages

| Page           | Route            | Description                                                     |
| :------------- | :--------------- | :-------------------------------------------------------------- |
| Login          | `/login`         | User authentication with email & password                       |
| Register       | `/register`      | New account creation with success modal & auto-redirect         |
| Dashboard      | `/dashboard`     | Financial overview with stats, pie chart, area chart & recent transactions |
| Wallets        | `/wallets`       | Wallet card grid with total accumulated balance display         |
| Transactions   | `/transactions`  | Full transaction list with search, multi-filter & pagination    |
| Settings       | `/settings`      | Profile info, password change & category management (tabbed UI) |
| Reports        | `/reports`       | Coming Soon                                                     |

---

## Installation & Setup

### 1. Prerequisites

- Node.js (LTS version recommended)
- PostgreSQL (local installation)
- nodemon (optional, for auto-restart on file changes)

**Linux (Ubuntu/Debian) — Install PostgreSQL:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Install nodemon globally (optional):**

```bash
npm install -g nodemon
```

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

### 3. Database Setup

#### Create the database

**Windows** — Open pgAdmin or psql and run:

```sql
CREATE DATABASE fintrack_db;
```

**Linux** — Run via terminal:

```bash
sudo -u postgres psql -c "CREATE DATABASE fintrack_db;"
```

> **Linux note:** If the `postgres` user password hasn't been set yet, set it first:
> ```bash
> sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_password';"
> ```

#### Create the tables

**Windows** — Open Query Tool in pgAdmin, select `fintrack_db`, then run the SQL below.

**Linux** — Run via terminal:

```bash
sudo -u postgres psql -d fintrack_db
```

Then paste and execute the following SQL:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) DEFAULT 'expense',
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50),
    balance DECIMAL(15,2) DEFAULT 0,
    color VARCHAR(100) DEFAULT 'indigo',
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    wallet_id INT REFERENCES wallets(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);
```

> **Note:** Default categories ("Gaji" as income, "Makanan" as expense) are automatically created per user during registration via the backend API. No manual seeding is required.

#### Accessing PostgreSQL via Terminal

**Windows (via Docker):**

```bash
docker exec -it postgres-dev psql -U postgres
```

**Linux (local installation):**

```bash
sudo -u postgres psql -d fintrack_db
```

Once inside the `psql` terminal, these shortcuts are useful:

- **General Commands:**
  - `\l` : List all databases.
  - `\c fintrack_db` : Connect to the `fintrack_db` database.
  - `\q` : Quit/Exit the psql terminal.

- **Viewing Tables:**
  - `\dt` : List tables in the current database.
  - `\d table_name` : Show structure (columns, types) of a specific table.

- **Common SQL Queries:**
  - `SELECT * FROM users;` : View all registered users.
  - `SELECT * FROM categories;` : View all categories.
  - `SELECT * FROM wallets;` : View all wallets.
  - `SELECT * FROM transactions;` : View all transactions.
  - `DELETE FROM transactions WHERE id = 1;` : Delete a specific transaction.

### 4. Setup & Run Backend

```bash
cd backend-fintrack
npm install
```

**Run with Node.js (standard):**

```bash
node index.js
```

**Run with nodemon (auto-restart on file change — recommended for development):**

```bash
nodemon index.js
```

The server will start at `http://localhost:5000`.

> **Linux note:** If you get a permission error on port 5000, make sure no other process is using it:
> ```bash
> sudo lsof -i :5000
> ```

### 5. Setup & Run Frontend

Open a **new terminal**, then:

```bash
cd frontend-fintrack
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.

> **Linux note:** If you cloned or moved this project from Windows, run the following once to fix line ending differences (CRLF → LF) that cause all files to appear as modified in Git:
> ```bash
> git config core.autocrlf input
> git rm --cached -r .
> git reset HEAD -- .
> ```

### 6. Running Both Servers

Backend and frontend must run simultaneously in **separate terminals**:

| Terminal | Command | URL |
| :------- | :------ | :-- |
| Terminal 1 | `cd backend-fintrack && nodemon index.js` | `http://localhost:5000` |
| Terminal 2 | `cd frontend-fintrack && npm run dev` | `http://localhost:5173` |

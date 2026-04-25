# FinTrack - Personal Finance Tracker

<div align="center">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js" />
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</div>

FinTrack is a full-stack personal finance tracking application designed to help users manage daily transactions and expense categories efficiently. The project is built with a modern architecture using Node.js on the Backend and React (Vite) on the Frontend.

---

## Key Features

- Transaction Management: Record and view financial transaction history.
- Categorization: Group transactions by categories (e.g., Food, Transport, Entertainment).
- Relational Database: Structured data storage using PostgreSQL.
- RESTful API: Seamless data communication between frontend and backend.

---

## Tech Stack

| Category    | Technology          |
| :---------- | :------------------ |
| Frontend    | React.js (Vite)     |
| Backend     | Node.js, Express.js |
| Database    | PostgreSQL          |
| API Testing | Postman / Insomnia  |
| Environment | Dotenv, CORS        |

---

## Project Structure

```text
FinTrack/
├── backend-fintrack/    # Server-side logic (Express & Node)
│   ├── .env             # Environment configuration (Hidden/Ignored)
│   ├── index.js         # Main API entry point
│   └── package.json     # Backend dependencies
├── frontend-fintrack/   # Client-side UI (React & Vite)
│   ├── src/             # React source files
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
└── .gitignore           # Git ignore configuration
```

---

## Database Schema

The application uses two main tables to manage financial data. Below is the SQL script to initialize the database structure:

```sql
-- 1. Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Create transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE
);

-- 3. Initial Data (Optional)
INSERT INTO categories (name) VALUES ('Food'), ('Transport'), ('Utilities'), ('Entertainment');
```

---

## Installation & Setup

### 1. Prerequisites

- Node.js (LTS version recommended)
- PostgreSQL (Local installation or Docker container)

### 2. Database Configuration

Create a `.env` file in the `backend-fintrack/` directory and provide your database credentials:

```env
DB_USER=your_username
DB_HOST=localhost
DB_DATABASE=fintrack_db
DB_PASSWORD=your_password
DB_PORT=5432
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

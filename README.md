# CRUD Project - Task Manager
![UI preview 1](./screens/Screen1_v2.png)
![UI preview 2](./screens/Screen2_v2.png)

## Link to webpage: https://task-manger-mz7h.onrender.com/
(Project was deployed on Render.com)

## Description:
Prosty menedżer zadań TO-DO list (pełny CRUD funkcjonał)
- Wyświetlanie zadań
- Dodawanie nowych zadań
- Edytowanie
- Usuwanie

## Technologies:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL

## How to start app local?
### Versions:
- Node.js 16+
- PostgreSQL

### **All steps bellow we do in VS Code Terminals:**

### Step 1: PostgreSQL DataBase
(new terminal)
```bash
cd database

#1) Delete table if exist in DB:
psql -U postgres -h localhost -c "DROP TABLE IF EXISTS tasks;"

#2) Delete DB:
psql -U postgres -h localhost -c "DROP DATABASE crud_app_1_db;"

#3) Create new DB:
psql -U postgres -h localhost -c "CREATE DATABASE crud_app_1_db;"

#4) Make Migration:
psql -U postgres -h localhost -d crud_app_1_db -f migration.sql
```

### Step 2: Backend configuration
(new terminal)
```bash
cd backend

# Install requirements
npm install

# Create .env file (fill your own values) 
cp .env.example .env
```
(You must in _.env_ file - change field  _User_password_ into your own)

### Step 3: Backend start server
```bash
# Dev mode
npm run dev

# OR production mode (if not working dev mode)
npm start
```

### Step 4: Frontend configure & start server
(new terminal)
```bash
cd frontend

# Install requirements
npm install

# Dev mode
npm run dev
```

## API Endpoints
(Każdy endpoint zwraca błędy 400,404,500 + validacja + success 200,201,204)

- GET /tasks - otrzymanie wszystkish zadań
- GET /tasks/:id - otrzymanie zadania po ID
- DELETE /tasks/:id - usuń zadanie
  
- POST /task - dodawanie nowego zadania
```
{
  "title_name": "New Task",
  "description": "Description",
  "deadline_date": "2025-00-00",
  "priority": "medium",
  "status": "pending"
}
```
- PUT /tasks/:id - aktualizacja zadania
```
{
  "title_name": "Update name",
  "status": "completed"
}
```

## Access in browser:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---------------------------------------------------------------
_**Creator: Anastasiia Bzova 2025**_

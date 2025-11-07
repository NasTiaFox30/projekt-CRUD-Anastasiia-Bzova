
-- Creating table of "Tasks"
CREATE TABLE IF NOT EXISTS Tasks (
    ID SERIAL PRIMARY KEY,
    title_name VARCHAR(50) NOT NULL,
    description TEXT,
    deadline_date DATE,
    status VARCHAR(50) CHECK (status IN ('pending', 'in-progress', 'completed')),
    priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high')),
    category VARCHAR(30),
    assigned_to VARCHAR(50),
    estimated_time INTEGER,
    notes TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Users table:
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- adding user_id
ALTER TABLE Tasks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES Users(id);

-- Index for search Task for User
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON Tasks(user_id);

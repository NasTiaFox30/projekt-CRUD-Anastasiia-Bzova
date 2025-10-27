
-- Creating table of "Tasks"
CREATE TABLE IF NOT EXISTS Tasks (
    ID SERIAL PRIMARY KEY,
    title_name VARCHAR(150) NOT NULL,
    description TEXT,
    deadline_date DATE,
    status VARCHAR(50) CHECK (status IN ('pending', 'in-progress', 'completed')),
    priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high')),
    category VARCHAR(100),
    assigned_to VARCHAR(100),
    estimated_time INTEGER,
    notes TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Test Data:
INSERT INTO Tasks (
  title_name, description, deadline_date,
  priority, status, category, assigned_to,
  estimated_time, notes
) VALUES
('Learn React', 'Complete React tutorial', '2025-10-20',
 'high', 'in-progress', 'Development', 'User1',
 5, 'Finish before weekend'),
('Prepare presentation', 'Slides for meeting', '2025-10-16',
 'medium', 'pending', 'Meetings', 'User2',
 2, 'Include charts and summary');

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

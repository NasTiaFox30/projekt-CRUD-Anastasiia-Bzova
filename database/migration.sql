
CREATE DATABASE crud_app_1_db;

-- Creating table of "Tasks"
CREATE TABLE Tasks (
    ID SERIAL PRIMARY KEY,
    title_name VARCHAR(150) NOT NULL,
    description TEXT,
    deadline_date DATE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Test Data:
INSERT INTO tasks (title_name, description, deadline_date,) VALUES
('Learn React', 'Complete React tutorial', '2025-10-20'),
('Prepare presentation', 'Slides for team meeting', '2025-10-16');
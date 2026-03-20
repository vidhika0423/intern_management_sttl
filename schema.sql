-- ================================
-- INTERN MANAGEMENT SYSTEM SCHEMA
-- ================================

-- Enable UUID and crypto extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'mentor', 'intern')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- DEPARTMENTS
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  head_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- INTERNS
CREATE TABLE interns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
  start_date DATE NOT NULL,
  end_date DATE,
  college VARCHAR(150),
  position_title VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- TASKS
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ATTENDANCE
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'wfh')),
  notes TEXT,
  UNIQUE(intern_id, date)
);

-- EVALUATIONS
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  score INTEGER CHECK (score BETWEEN 1 AND 10),
  feedback TEXT,
  period VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- DOCUMENTS
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  type VARCHAR(50),
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- ANNOUNCEMENTS
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  audience VARCHAR(30) DEFAULT 'all' CHECK (audience IN ('all', 'interns_only', 'mentors_only')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- SAMPLE DATA
-- ================================

-- Departments
INSERT INTO departments (name, description) VALUES
  ('Engineering',  'Software development and tech'),
  ('Design',       'UI/UX and product design'),
  ('Marketing',    'Growth and communications'),
  ('HR',           'Human resources and operations');

-- Users (admin + mentors + interns)
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin User',    'admin@company.com',         crypt('admin123',  gen_salt('bf')), 'admin'),
  ('Amit Patel',    'amit.patel@company.com',     crypt('amit123',   gen_salt('bf')), 'mentor'),
  ('Priya Mehta',   'priya.mehta@company.com',    crypt('priya123',  gen_salt('bf')), 'mentor'),
  ('Rahul Sharma',  'rahul.sharma@example.com',   crypt('rahul123',  gen_salt('bf')), 'intern'),
  ('Sneha Patel',   'sneha.patel@example.com',    crypt('sneha123',  gen_salt('bf')), 'intern'),
  ('Karan Desai',   'karan.desai@example.com',    crypt('karan123',  gen_salt('bf')), 'intern'),
  ('Meera Shah',    'meera.shah@example.com',     crypt('meera123',  gen_salt('bf')), 'intern'),
  ('Arjun Trivedi', 'arjun.trivedi@example.com',  crypt('arjun123',  gen_salt('bf')), 'intern');

-- Interns
INSERT INTO interns (user_id, department_id, mentor_id, status, start_date, end_date, college, position_title)
VALUES
  (
    (SELECT id FROM users WHERE email = 'rahul.sharma@example.com'),
    (SELECT id FROM departments WHERE name = 'Engineering'),
    (SELECT id FROM users WHERE email = 'amit.patel@company.com'),
    'active', '2025-06-01', '2025-08-31', 'PDEU Ahmedabad', 'Frontend Intern'
  ),
  (
    (SELECT id FROM users WHERE email = 'sneha.patel@example.com'),
    (SELECT id FROM departments WHERE name = 'Design'),
    (SELECT id FROM users WHERE email = 'priya.mehta@company.com'),
    'active', '2025-06-01', '2025-08-31', 'GTU Ahmedabad', 'UI/UX Intern'
  ),
  (
    (SELECT id FROM users WHERE email = 'karan.desai@example.com'),
    (SELECT id FROM departments WHERE name = 'Engineering'),
    (SELECT id FROM users WHERE email = 'amit.patel@company.com'),
    'active', '2025-05-01', '2025-07-31', 'DAIICT Gandhinagar', 'Backend Intern'
  ),
  (
    (SELECT id FROM users WHERE email = 'meera.shah@example.com'),
    (SELECT id FROM departments WHERE name = 'Marketing'),
    (SELECT id FROM users WHERE email = 'priya.mehta@company.com'),
    'completed', '2025-01-01', '2025-03-31', 'LD College Ahmedabad', 'Marketing Intern'
  ),
  (
    (SELECT id FROM users WHERE email = 'arjun.trivedi@example.com'),
    (SELECT id FROM departments WHERE name = 'HR'),
    (SELECT id FROM users WHERE email = 'amit.patel@company.com'),
    'active', '2025-07-01', '2025-09-30', 'Nirma University', 'HR Intern'
  );

-- Tasks
INSERT INTO tasks (intern_id, assigned_by, title, description, status, priority, due_date)
VALUES
  (
    (SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'rahul.sharma@example.com')),
    (SELECT id FROM users WHERE email = 'amit.patel@company.com'),
    'Build login page', 'Create responsive login UI with form validation', 'in_progress', 'high', '2025-07-15'
  ),
  (
    (SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'rahul.sharma@example.com')),
    (SELECT id FROM users WHERE email = 'amit.patel@company.com'),
    'Setup API integration', 'Connect frontend to GraphQL API', 'todo', 'medium', '2025-07-20'
  ),
  (
    (SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'sneha.patel@example.com')),
    (SELECT id FROM users WHERE email = 'priya.mehta@company.com'),
    'Design dashboard mockup', 'Create Figma mockup for main dashboard', 'done', 'high', '2025-06-30'
  ),
  (
    (SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'karan.desai@example.com')),
    (SELECT id FROM users WHERE email = 'amit.patel@company.com'),
    'Write database migrations', 'Create SQL migration scripts for new tables', 'in_review', 'medium', '2025-07-10'
  ),
  (
    (SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'arjun.trivedi@example.com')),
    (SELECT id FROM users WHERE email = 'amit.patel@company.com'),
    'Prepare onboarding docs', 'Document intern onboarding checklist', 'todo', 'low', '2025-07-25'
  );

-- Attendance
INSERT INTO attendance (intern_id, date, check_in, check_out, status) VALUES
  ((SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'rahul.sharma@example.com')), '2025-07-01', '09:05', '18:10', 'present'),
  ((SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'rahul.sharma@example.com')), '2025-07-02', '09:15', '18:00', 'present'),
  ((SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'rahul.sharma@example.com')), '2025-07-03', null,    null,    'absent'),
  ((SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'sneha.patel@example.com')),  '2025-07-01', '09:00', '18:00', 'present'),
  ((SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'sneha.patel@example.com')),  '2025-07-02', '09:30', '14:00', 'half_day'),
  ((SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'karan.desai@example.com')),  '2025-07-01', '10:00', '18:30', 'wfh'),
  ((SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'karan.desai@example.com')),  '2025-07-02', '09:00', '18:00', 'present'),
  ((SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'arjun.trivedi@example.com')),'2025-07-01', '09:10', '18:05', 'present');

-- Evaluations
INSERT INTO evaluations (intern_id, evaluator_id, score, feedback, period) VALUES
  (
    (SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'rahul.sharma@example.com')),
    (SELECT id FROM users WHERE email = 'amit.patel@company.com'),
    8, 'Rahul shows strong initiative and picks up concepts quickly.', 'Week 4'
  ),
  (
    (SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'sneha.patel@example.com')),
    (SELECT id FROM users WHERE email = 'priya.mehta@company.com'),
    9, 'Sneha delivers exceptional design work. Very detail-oriented.', 'Midterm'
  ),
  (
    (SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'karan.desai@example.com')),
    (SELECT id FROM users WHERE email = 'amit.patel@company.com'),
    7, 'Karan is technically sound but needs to improve documentation.', 'Week 4'
  ),
  (
    (SELECT id FROM interns WHERE user_id = (SELECT id FROM users WHERE email = 'meera.shah@example.com')),
    (SELECT id FROM users WHERE email = 'priya.mehta@company.com'),
    9, 'Meera completed all tasks ahead of schedule. Excellent performance.', 'Final'
  );

-- Announcements
INSERT INTO announcements (created_by, title, body, audience) VALUES
  (
    (SELECT id FROM users WHERE email = 'admin@company.com'),
    'Welcome to Summer Internship 2025!',
    'We are excited to welcome all our interns for the Summer 2025 batch. Please check your onboarding documents and reach out to your mentors.',
    'all'
  ),
  (
    (SELECT id FROM users WHERE email = 'admin@company.com'),
    'Weekly standup schedule',
    'All interns are required to attend the Monday 10am standup meeting. Please join the Google Meet link shared on your email.',
    'interns_only'
  ),
  (
    (SELECT id FROM users WHERE email = 'admin@company.com'),
    'Mentor evaluation reminder',
    'Please submit your intern evaluations for Week 4 by this Friday.',
    'mentors_only'
  );

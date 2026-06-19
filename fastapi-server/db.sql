-- ============================================================
-- Knowledge Transfer Graph - PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

```
email VARCHAR(255) UNIQUE NOT NULL,
username VARCHAR(50) UNIQUE NOT NULL,

password_hash TEXT NOT NULL,

full_name VARCHAR(150),

profession VARCHAR(50) DEFAULT 'other',

organization VARCHAR(250),

department VARCHAR(250),

bio TEXT,

avatar_url TEXT,

website_url TEXT,

is_verified BOOLEAN DEFAULT FALSE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

);

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_username
ON users(username);

CREATE INDEX idx_users_profession
ON users(profession);

-- ============================================================
-- PAPERS
-- ============================================================

CREATE TABLE papers (
id SERIAL PRIMARY KEY,

```
title TEXT NOT NULL,

abstract TEXT,

year INTEGER,

novelty FLOAT DEFAULT 0,

prediction VARCHAR(100),

probability FLOAT,

confidence VARCHAR(50),

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

);

CREATE INDEX idx_papers_title
ON papers(title);

CREATE INDEX idx_papers_year
ON papers(year);

CREATE INDEX idx_papers_prediction
ON papers(prediction);

-- ============================================================
-- OPTIONAL UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS core_art_comments CASCADE;
DROP TABLE IF EXISTS core_art_likes CASCADE;
DROP TABLE IF EXISTS core_concept_art_tags CASCADE;
DROP TABLE IF EXISTS core_art_media CASCADE;
DROP TABLE IF EXISTS core_concept_art CASCADE;
DROP TABLE IF EXISTS master_users CASCADE;

-- Drop enums after all tables are gone
DROP TYPE IF EXISTS tier_type CASCADE;
DROP TYPE IF EXISTS status_type CASCADE;

CREATE TYPE tier_type AS ENUM ('member', 'pro', 'corporate');
CREATE TYPE status_type AS ENUM('Open', 'In Progress', 'Closed');

-- 1. Create User table
CREATE TABLE master_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role tier_type DEFAULT 'member'
);

-- 2. Create Concept Art table
CREATE TABLE core_concept_art (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES master_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status status_type DEFAULT 'Open',
    tag TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE core_art_media (
    id SERIAL PRIMARY KEY,
    art_id INTEGER NOT NULL REFERENCES core_concept_art(id) ON DELETE CASCADE,
    media VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE core_art_likes (
    id SERIAL PRIMARY KEY,
    art_id INTEGER NOT NULL REFERENCES core_concept_art(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES master_users(id) ON DELETE CASCADE,
    UNIQUE (art_id, user_id)
);

CREATE TABLE core_art_comments (
    id SERIAL PRIMARY KEY,
    art_id INTEGER NOT NULL REFERENCES core_concept_art(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES master_users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()    
);

-- 3. Create Dev Log table
CREATE TABLE core_dev_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES master_users (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Community Page table
CREATE TABLE core_community_page (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES master_users (id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    image VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Job Listing table
CREATE TABLE core_job_listing (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES master_users (id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    jobrole VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Resumes table
CREATE TABLE master_resumes (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES core_job_listing(id) ON DELETE CASCADE,
    resume VARCHAR(255),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);


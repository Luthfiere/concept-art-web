-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS core_application_notes CASCADE;
DROP TABLE IF EXISTS core_job_applications CASCADE;
DROP TABLE IF EXISTS core_job_posting CASCADE;
DROP TABLE IF EXISTS core_messages CASCADE;
DROP TABLE IF EXISTS core_conversations CASCADE;
DROP TABLE IF EXISTS core_art_comments CASCADE;
DROP TABLE IF EXISTS core_art_likes CASCADE;
DROP TABLE IF EXISTS core_concept_art_tags CASCADE;
DROP TABLE IF EXISTS core_art_media CASCADE;
DROP TABLE IF EXISTS core_concept_art CASCADE;
DROP TABLE IF EXISTS master_users CASCADE;

-- Drop enums after all tables are gone
DROP TYPE IF EXISTS tier_type CASCADE;
DROP TYPE IF EXISTS status_type CASCADE;
DROP TYPE IF EXISTS art_category CASCADE;
DROP TYPE IF EXISTS work_option_type CASCADE;
DROP TYPE IF EXISTS work_type_type CASCADE;
DROP TYPE IF EXISTS job_status_type CASCADE;
DROP TYPE IF EXISTS currency_type CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;

CREATE TYPE tier_type AS ENUM ('member', 'pro', 'corporate');
CREATE TYPE status_type AS ENUM('Open', 'In Progress', 'Closed');
CREATE TYPE art_category AS ENUM('art', 'post'); -- for art & post without art
CREATE TYPE work_option_type AS ENUM ('On-site', 'Hybrid', 'Remote');
CREATE TYPE work_type_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Casual');
CREATE TYPE job_status_type AS ENUM ('Draft', 'Active', 'Expired', 'Blocked');
CREATE TYPE currency_type AS ENUM ('AUD', 'HKD', 'IDR', 'MYR', 'NZD', 'PHP', 'SGD', 'THB', 'USD');
CREATE TYPE application_status AS ENUM ('pending', 'shortlisted', 'rejected', 'hired');


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
    category art_category DEFAULT 'art',
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

-- Create Conversations table (DM threads)
CREATE TABLE core_conversations (
    id SERIAL PRIMARY KEY,
    art_id INTEGER NOT NULL REFERENCES core_concept_art(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES master_users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES master_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (art_id, sender_id, receiver_id)
);

-- Create Messages table
CREATE TABLE core_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES core_conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES master_users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Job Posting table
CREATE TABLE core_job_posting (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES master_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL, -- e.g. 'Senior Concept Artist'
    description TEXT, 
    job_location VARCHAR(255), 
    work_option work_option_type, 
    work_type work_type_type,             
    salary_min INTEGER,                    
    salary_max INTEGER,                   
    salary_currency currency_type DEFAULT 'IDR',
    status job_status_type DEFAULT 'Draft',
    expired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE core_job_applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES core_job_posting(id) ON DELETE CASCADE,
    applicant_id INTEGER NOT NULL REFERENCES master_users(id) ON DELETE CASCADE,
    status application_status DEFAULT 'pending',
    cover_letter TEXT,
    cv VARCHAR(255),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (job_id, applicant_id)  
);

-- 4. Create Dev Log table
CREATE TABLE core_dev_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES master_users (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Community Page table
CREATE TABLE core_community_page (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES master_users (id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    image VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Resumes table
CREATE TABLE master_resumes (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES core_job_listing(id) ON DELETE CASCADE,
    resume VARCHAR(255),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);


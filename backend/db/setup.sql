-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS job_listing CASCADE;
DROP TABLE IF EXISTS community_page CASCADE;
DROP TABLE IF EXISTS dev_log CASCADE;
DROP TABLE IF EXISTS concept_art CASCADE;
DROP TABLE IF EXISTS user CASCADE;

-- Drop enums after all tables are gone
DROP TYPE IF EXISTS tier_type CASCADE;

CREATE TYPE tier_type AS ENUM ('guest', 'member', 'corporate');

-- 1. Create User table
CREATE TABLE user (
    userid SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role tier_type DEFAULT 'guest'
);

-- 2. Create Concept Art table
CREATE TABLE concept_art (
    artid SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES user (userid) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    createdat TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Dev Log table
CREATE TABLE dev_log (
    devlogid SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES user (userid) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    createdat TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Community Page table
CREATE TABLE community_page (
    pageid SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES user (userid) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    image VARCHAR(255),
    createdat TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Job Listing table
CREATE TABLE job_listing (
    jobid SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES user (userid) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    jobrole VARCHAR(255),
    createdat TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Resumes table
CREATE TABLE resumes (
    resumesid SERIAL PRIMARY KEY,
    jobid INTEGER NOT NULL REFERENCES job_listing(jobid) ON DELETE CASCADE,
    resume VARCHAR(255),
    uploadedat TIMESTAMPTZ DEFAULT NOW()
);


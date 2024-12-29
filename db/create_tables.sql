CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    google_id VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    long_url TEXT NOT NULL,
    alias VARCHAR(255) UNIQUE NOT NULL,
    short_url TEXT NOT NULL,
    topic VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS url_logs (
    id SERIAL PRIMARY KEY,
    url_id INT REFERENCES urls(id),
    ip_address VARCHAR(255),
    os_name VARCHAR(255),
    device_name VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW()
);

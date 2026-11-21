-- Optional: SQLAlchemy creates tables automatically. Use this to set up MySQL manually.
CREATE DATABASE IF NOT EXISTS lostfound;
USE lostfound;
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kind VARCHAR(10) NOT NULL, title VARCHAR(120) NOT NULL, category VARCHAR(40) NOT NULL,
  color VARCHAR(40), brand VARCHAR(60), location VARCHAR(80) NOT NULL,
  event_time DATETIME NOT NULL, description TEXT, private_detail TEXT,
  reporter_name VARCHAR(80) NOT NULL, reporter_email VARCHAR(120) NOT NULL,
  status VARCHAR(20) DEFAULT 'open', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (kind), INDEX (category), INDEX (location)
);
CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY, lost_id INT NOT NULL, found_id INT NOT NULL,
  score FLOAT NOT NULL, status VARCHAR(20) DEFAULT 'potential', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lost_id) REFERENCES reports(id), FOREIGN KEY (found_id) REFERENCES reports(id)
);
CREATE TABLE claims (
  id INT AUTO_INCREMENT PRIMARY KEY, match_id INT NOT NULL, claimant_answer TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

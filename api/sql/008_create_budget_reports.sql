CREATE TABLE IF NOT EXISTS budget_reports (
  id VARCHAR(80) NOT NULL,
  title VARCHAR(250) NOT NULL,
  organization VARCHAR(180) NOT NULL,
  period VARCHAR(120) NOT NULL,
  summary TEXT NOT NULL,
  source_name VARCHAR(180) NOT NULL,
  source_url VARCHAR(2048) NOT NULL,
  metrics JSON NOT NULL,
  evidence JSON NOT NULL,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_budget_reports_published (published_at)
);

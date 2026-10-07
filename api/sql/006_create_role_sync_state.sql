CREATE TABLE IF NOT EXISTS role_sync_state (
  source_name VARCHAR(40) NOT NULL,
  synced_at DATETIME NOT NULL,
  PRIMARY KEY (source_name)
) ENGINE=InnoDB;

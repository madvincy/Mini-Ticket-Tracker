CREATE TABLE IF NOT EXISTS ticket_status_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT UNSIGNED NOT NULL,
  event_type ENUM('created', 'status_changed', 'baseline') NOT NULL DEFAULT 'status_changed',
  from_status ENUM('open', 'in_progress', 'closed') NULL,
  to_status ENUM('open', 'in_progress', 'closed') NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket_status_history_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  INDEX idx_ticket_status_history_ticket_changed (ticket_id, changed_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
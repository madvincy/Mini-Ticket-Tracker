SET @has_event_type = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ticket_status_history'
    AND COLUMN_NAME = 'event_type'
);
SET @add_event_type = IF(
  @has_event_type = 0,
  'ALTER TABLE ticket_status_history ADD COLUMN event_type ENUM(''created'', ''status_changed'', ''baseline'') NOT NULL DEFAULT ''status_changed'' AFTER ticket_id',
  'SELECT 1'
);
PREPARE add_event_type_statement FROM @add_event_type;
EXECUTE add_event_type_statement;
DEALLOCATE PREPARE add_event_type_statement;

INSERT INTO ticket_status_history (ticket_id, event_type, from_status, to_status, changed_at)
SELECT ticket.id, 'baseline', NULL, ticket.status, UTC_TIMESTAMP()
FROM tickets AS ticket
WHERE NOT EXISTS (
  SELECT 1
  FROM ticket_status_history AS history
  WHERE history.ticket_id = ticket.id
);
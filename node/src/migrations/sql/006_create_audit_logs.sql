-- Migration: 006_create_audit_logs
-- Description: Unified enterprise audit trail with fast pagination index

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `actor_type` ENUM('SUPER_ADMIN', 'DASHBOARD_USER', 'SYSTEM') NOT NULL,
  `actor_id` BIGINT DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `resource` VARCHAR(100) NOT NULL,
  `resource_id` VARCHAR(100) DEFAULT NULL,
  `payload_before` JSON DEFAULT NULL,
  `payload_after` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_pagination` (`created_at` DESC, `actor_type`, `actor_id`),
  INDEX `idx_audit_resource` (`resource`, `resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

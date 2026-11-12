-- Migration: 005_create_sessions
-- Description: Active sessions and token revocation tracking with sub-millisecond covering index

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_type` ENUM('SUPER_ADMIN', 'DASHBOARD_USER') NOT NULL,
  `user_id` BIGINT NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL UNIQUE,
  `refresh_token_hash` VARCHAR(255) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `is_revoked` BOOLEAN DEFAULT FALSE,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sessions_auth_covering` (`token_hash`, `is_revoked`, `expires_at`, `user_type`, `user_id`),
  INDEX `idx_sessions_user` (`user_type`, `user_id`),
  INDEX `idx_sessions_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

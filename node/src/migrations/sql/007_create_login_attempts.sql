-- Migration: 007_create_login_attempts
-- Description: Brute-force defense and account lockout tracking

CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_type` ENUM('SUPER_ADMIN', 'DASHBOARD_USER') NOT NULL,
  `is_successful` BOOLEAN NOT NULL DEFAULT FALSE,
  `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_login_lockout` (`email`, `ip_address`, `is_successful`, `attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

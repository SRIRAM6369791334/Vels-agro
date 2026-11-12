-- Migration: 009_add_job_title_to_users
-- Description: Add job_title column to admin_users and dashboard_users for complete profile management

ALTER TABLE `admin_users` 
  ADD COLUMN `job_title` VARCHAR(100) DEFAULT 'Super Administrator' AFTER `phone`;

ALTER TABLE `dashboard_users` 
  ADD COLUMN `job_title` VARCHAR(100) DEFAULT 'Operations Staff' AFTER `phone`;

-- Migration: 008_seed_initial_rbac
-- Description: Seed system roles and granular module permissions

-- 1. Insert Core System Roles
INSERT INTO `roles` (`id`, `name`, `description`, `is_system`) VALUES
(1, 'Admin Manager', 'Full operational access to inventory, orders, customers, and reporting', TRUE),
(2, 'Inventory Specialist', 'Stock management, products, batches, warehouse transfers', TRUE),
(3, 'Sales Representative', 'View products, manage orders and customer directory', TRUE),
(4, 'Read Only Auditor', 'Read-only access to analytics, audit logs, and operational reports', TRUE)
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 2. Insert Standard Module Permissions
INSERT INTO `permissions` (`code`, `module`, `description`) VALUES
-- Products & Catalog
('products.view', 'products', 'View product catalog and batch details'),
('products.create', 'products', 'Create new products and formulate BOMs'),
('products.edit', 'products', 'Edit product specifications and pricing'),
('products.adjust_stock', 'products', 'Adjust inventory quantities across warehouses'),

-- Orders & Fulfillment
('orders.view', 'orders', 'View customer sales orders and kanban stages'),
('orders.create', 'orders', 'Create new manual sales orders'),
('orders.update_stage', 'orders', 'Advance order fulfillment stages (Picking, Dispatched, Delivered)'),
('orders.manage_returns', 'orders', 'Process and authorize customer returns'),

-- Customers & Dealers
('customers.view', 'customers', 'View customer and dealer directory'),
('customers.manage', 'customers', 'Create and edit customer records, credit terms, and RFM status'),

-- Purchasing & Warehouses
('warehouses.view', 'warehouses', 'View warehouse facility capacities and stock levels'),
('warehouses.transfer', 'warehouses', 'Execute inter-facility inventory stock transfers'),
('purchasing.view', 'purchasing', 'View vendor purchase orders and raw material stock'),
('purchasing.manage', 'purchasing', 'Create purchase orders and receive supplier deliveries'),

-- Analytics & Auditing
('analytics.view', 'analytics', 'Access high-level KPI executive charts and financial velocity'),
('audit_logs.view', 'audit', 'Inspect system security and administrative audit trail')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 3. Map Permissions to Admin Manager (Role ID 1 -> All permissions)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions`;

-- 4. Map Permissions to Inventory Specialist (Role ID 2 -> Products, Warehouses, Purchasing)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `permissions` 
WHERE `module` IN ('products', 'warehouses', 'purchasing');

-- 5. Map Permissions to Sales Representative (Role ID 3 -> Orders, Customers, Products View)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, `id` FROM `permissions` 
WHERE `code` IN ('products.view', 'orders.view', 'orders.create', 'orders.update_stage', 'customers.view', 'customers.manage');

-- 6. Map Permissions to Read Only Auditor (Role ID 4 -> All .view permissions)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 4, `id` FROM `permissions` 
WHERE `code` LIKE '%.view';

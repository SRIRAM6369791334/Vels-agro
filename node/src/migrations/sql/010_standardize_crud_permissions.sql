-- Migration: 010_standardize_crud_permissions
-- Description: Standardize permissions into modular CRUD matrix (Create, Read, Update, Delete)

INSERT INTO `permissions` (`code`, `module`, `description`) VALUES
-- Products & Formulas
('products.create', 'products', 'Create new products, raw materials and formulas (C)'),
('products.read', 'products', 'View catalog, batch details, formulations and stock (R)'),
('products.update', 'products', 'Edit product specifications, pricing and adjustments (U)'),
('products.delete', 'products', 'Delete or archive discontinued products and batches (D)'),

-- Sales Orders & Fulfillment
('orders.create', 'orders', 'Create new sales orders, quotes and invoices (C)'),
('orders.read', 'orders', 'View sales orders, stages, dispatch and customer status (R)'),
('orders.update', 'orders', 'Advance fulfillment stages, edit orders and packaging (U)'),
('orders.delete', 'orders', 'Cancel, refund, or delete customer sales orders (D)'),

-- Customers & Stockists
('customers.create', 'customers', 'Register new stockists, distributors and shoppers (C)'),
('customers.read', 'customers', 'View customer directory, order history and credit (R)'),
('customers.update', 'customers', 'Update customer terms, addresses and contact records (U)'),
('customers.delete', 'customers', 'Delete or blacklist customer and stockist accounts (D)'),

-- Purchasing & Raw Materials
('purchasing.create', 'purchasing', 'Create purchase orders and vendor requests (C)'),
('purchasing.read', 'purchasing', 'View purchase orders, supplier logs and raw stock (R)'),
('purchasing.update', 'purchasing', 'Receive shipments and update purchase orders (U)'),
('purchasing.delete', 'purchasing', 'Cancel, void, or delete supplier purchase orders (D)'),

-- Team & RBAC Management
('team.create', 'team', 'Invite team members and create custom roles (C)'),
('team.read', 'team', 'View staff directory, assigned roles and permissions (R)'),
('team.update', 'team', 'Modify teammate details, roles and permission matrix (U)'),
('team.delete', 'team', 'Deactivate/remove teammates and delete custom roles (D)')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `module` = VALUES(`module`);

-- Map Admin Manager (Role ID 1 -> All CRUD permissions)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions`;

-- Map Inventory Specialist (Role ID 2 -> CRU on Products & Purchasing, R on Orders)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `permissions`
WHERE `code` IN (
  'products.create', 'products.read', 'products.update',
  'purchasing.create', 'purchasing.read', 'purchasing.update',
  'orders.read'
);

-- Map Sales Representative (Role ID 3 -> CRU on Orders & Customers, R on Products)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, `id` FROM `permissions`
WHERE `code` IN (
  'orders.create', 'orders.read', 'orders.update',
  'customers.create', 'customers.read', 'customers.update',
  'products.read'
);

-- Map Read Only Auditor (Role ID 4 -> Read only on all modules)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 4, `id` FROM `permissions`
WHERE `code` LIKE '%.read';

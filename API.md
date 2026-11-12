# 📡 Complete REST API Documentation (`API.md`)

This document serves as the single source of truth for the Backend REST API built in `node`.

---

## 🌐 1. Global Conventions

* **Base URL**: `http://localhost:5000/api/v1`
* **Content-Type**: `application/json`
* **Authentication**: Bearer Token in Header
  ```http
  Authorization: Bearer <jwt_token>
  ```

### 📋 Mandatory Response Format (Every response includes `statusCode`)

#### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully.",
  "data": { ... },
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Specific error description",
  "error": "BAD_REQUEST"
}
```

---

## 📌 Module 1: Authentication & Sessions (`/api/v1/auth`)

---

### 1.1 Superadmin Login
* **Endpoint**: `/api/v1/auth/admin/login`
* **Method**: `POST`
* **Access**: Public
* **Security**: Brute-force lockout (5 attempts / 15 mins) + Bcrypt verification
* **Request Body**:
```json
{
  "email": "admin@velsagro.com",
  "password": "SuperAdmin@123"
}
```
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Superadmin login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "email": "admin@velsagro.com",
      "firstName": "Super",
      "lastName": "Administrator",
      "phone": null,
      "userType": "SUPER_ADMIN",
      "role": "Super Administrator"
    }
  }
}
```
* **Error Responses**:
  * `400 Bad Request`: `{ "success": false, "statusCode": 400, "message": "Email and password are required." }`
  * `401 Unauthorized`: `{ "success": false, "statusCode": 401, "message": "Invalid email or password." }`
  * `429 Too Many Requests`: `{ "success": false, "statusCode": 429, "message": "Account temporarily locked due to multiple failed attempts. Try again in 14 minute(s)." }`

---

### 1.2 Dashboard Staff User Login
* **Endpoint**: `/api/v1/auth/dashboard/login`
* **Method**: `POST`
* **Access**: Public
* **Security**: Brute-force lockout + Bcrypt verification + Inactive check
* **Request Body**:
```json
{
  "email": "rajesh@velsagro.com",
  "password": "UserPass@123"
}
```
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "rajesh@velsagro.com",
      "firstName": "Rajesh",
      "lastName": "Kumar",
      "phone": "+91 9876543210",
      "roleId": 2,
      "roleName": "Inventory Specialist",
      "permissions": [
        "products.view",
        "products.create",
        "products.edit",
        "products.adjust_stock",
        "warehouses.view",
        "warehouses.transfer",
        "purchasing.view",
        "purchasing.manage"
      ]
    }
  }
}
```
* **Error Responses**:
  * `401 Unauthorized`: Invalid credentials
  * `403 Forbidden`: Account deactivated by Superadmin

---

### 1.3 Logout (Revoke Session)
* **Endpoint**: `/api/v1/auth/logout`
* **Method**: `POST`
* **Access**: Authenticated (`Bearer <token>`)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully."
}
```

---

### 1.4 Get Current Profile
* **Endpoint**: `/api/v1/auth/me`
* **Method**: `GET`
* **Access**: Authenticated (`Bearer <token>`)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current profile retrieved.",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@velsagro.com",
      "firstName": "Super",
      "user_type": "SUPER_ADMIN",
      "role_name": "Super Administrator",
      "permissions": ["*"]
    }
  }
}
```

---

## 📌 Module 2: Dashboard Users Management (`/api/v1/admin/dashboard-users`)

*(All endpoints in Module 2 require Superadmin Bearer token)*

---

### 2.1 List Dashboard Users
* **Endpoint**: `/api/v1/admin/dashboard-users`
* **Method**: `GET`
* **Query Parameters**:
  * `page` (default: 1)
  * `limit` (default: 20)
  * `q` (search term for name, email, phone)
  * `role_id` (filter by role ID)
  * `is_active` (`true` or `false`)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard users retrieved successfully.",
  "data": [
    {
      "id": 1,
      "email": "rajesh@velsagro.com",
      "first_name": "Rajesh",
      "last_name": "Kumar",
      "phone": "+91 9876543210",
      "role_id": 2,
      "role_name": "Inventory Specialist",
      "is_active": 1,
      "created_by_admin_id": 1,
      "created_by_name": "Super Administrator",
      "last_login_at": "2026-11-12T06:20:00.000Z",
      "created_at": "2026-11-12T06:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 2.2 Get Single Dashboard User by ID
* **Endpoint**: `/api/v1/admin/dashboard-users/:id`
* **Method**: `GET`
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User details retrieved.",
  "data": {
    "id": 1,
    "email": "rajesh@velsagro.com",
    "first_name": "Rajesh",
    "last_name": "Kumar",
    "phone": "+91 9876543210",
    "role_id": 2,
    "role_name": "Inventory Specialist",
    "is_active": 1,
    "permissions": [
      {
        "id": 1,
        "code": "products.view",
        "module": "products",
        "description": "View product catalog and batch details"
      }
    ]
  }
}
```

---

### 2.3 Create Dashboard User
* **Endpoint**: `/api/v1/admin/dashboard-users`
* **Method**: `POST`
* **Request Body**:
```json
{
  "email": "karthik@velsagro.com",
  "password": "Password@123",
  "first_name": "Karthik",
  "last_name": "Selvam",
  "phone": "+91 9123456789",
  "role_id": 3
}
```
* **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Dashboard user created successfully.",
  "data": {
    "id": 2,
    "email": "karthik@velsagro.com",
    "firstName": "Karthik",
    "lastName": "Selvam",
    "phone": "+91 9123456789",
    "roleId": 3,
    "roleName": "Sales Representative",
    "isActive": true
  }
}
```
* **Error Response (`409 Conflict`)**:
```json
{
  "success": false,
  "statusCode": 409,
  "message": "A dashboard user with this email address already exists."
}
```

---

### 2.4 Update Dashboard User Details
* **Endpoint**: `/api/v1/admin/dashboard-users/:id`
* **Method**: `PUT`
* **Request Body**:
```json
{
  "first_name": "Karthik",
  "last_name": "Rajan",
  "phone": "+91 9999988888",
  "role_id": 1
}
```
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard user updated successfully.",
  "data": {
    "id": 2,
    "firstName": "Karthik",
    "lastName": "Rajan",
    "phone": "+91 9999988888",
    "roleId": 1
  }
}
```

---

### 2.5 Superadmin Manual Password Reset
* **Endpoint**: `/api/v1/admin/dashboard-users/:id/reset-password`
* **Method**: `PATCH`
* **Note**: Immediately revokes all active sessions for the targeted user, requiring re-login.
* **Request Body**:
```json
{
  "new_password": "NewSecurePassword@2026"
}
```
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password for user karthik@velsagro.com has been reset successfully. Active sessions revoked."
}
```

---

### 2.6 Toggle User Status (Active / Inactive)
* **Endpoint**: `/api/v1/admin/dashboard-users/:id/status`
* **Method**: `PATCH`
* **Note**: When `is_active: false`, immediately terminates all active sessions.
* **Request Body**:
```json
{
  "is_active": false
}
```
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard user account deactivated successfully.",
  "data": {
    "id": 2,
    "email": "karthik@velsagro.com",
    "isActive": false
  }
}
```

---

## 📌 Module 3: Roles & Permissions RBAC (`/api/v1/admin/roles`)

---

### 3.1 List All Roles & Assigned Permissions
* **Endpoint**: `/api/v1/admin/roles`
* **Method**: `GET`
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Roles retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Admin Manager",
      "description": "Full operational access to inventory, orders, customers, and reporting",
      "is_system": 1,
      "permissionsCount": 16,
      "permissions": [ ... ]
    }
  ]
}
```

---

### 3.2 List All 16 System Permissions
* **Endpoint**: `/api/v1/admin/roles/permissions`
* **Method**: `GET`
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Permissions retrieved successfully.",
  "data": {
    "total": 16,
    "modules": {
      "products": [ ... ],
      "orders": [ ... ],
      "customers": [ ... ],
      "warehouses": [ ... ],
      "purchasing": [ ... ],
      "analytics": [ ... ],
      "audit": [ ... ]
    }
  }
}
```

---

### 3.3 Create Custom Role
* **Endpoint**: `/api/v1/admin/roles`
* **Method**: `POST`
* **Request Body**:
```json
{
  "name": "Warehouse Dispatcher",
  "description": "Dispatches orders and transfers stock",
  "permission_ids": [1, 4, 11, 12]
}
```
* **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Role created successfully.",
  "data": {
    "id": 5,
    "name": "Warehouse Dispatcher",
    "description": "Dispatches orders and transfers stock",
    "isSystem": false,
    "permissionCount": 4
  }
}
```

---

### 3.4 Update Role
* **Endpoint**: `/api/v1/admin/roles/:id`
* **Method**: `PUT`
* **Request Body**:
```json
{
  "name": "Senior Warehouse Dispatcher",
  "description": "Updated duties",
  "permission_ids": [1, 4, 11, 12, 13]
}
```
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Role updated successfully."
}
```

---

### 3.5 Delete Custom Role
* **Endpoint**: `/api/v1/admin/roles/:id`
* **Method**: `DELETE`
* **Guard**: System roles (`is_system = 1`) or roles with assigned users cannot be deleted (`400`/`403`).
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Role \"Warehouse Dispatcher\" deleted successfully."
}
```

---

## 📌 Module 4: Audit Logs & Security Monitoring (`/api/v1/admin`)

---

### 4.1 Get Fast Paginated Audit Logs
* **Endpoint**: `/api/v1/admin/audit-logs`
* **Method**: `GET`
* **Query Parameters**:
  * `page` (default: 1)
  * `limit` (default: 25)
  * `actor_type` (`SUPER_ADMIN`, `DASHBOARD_USER`)
  * `action` (`LOGIN`, `CREATE_DASHBOARD_USER`, `MANUAL_PASSWORD_RESET`, etc.)
  * `resource` (`dashboard_users`, `roles`, `sessions`)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Audit logs retrieved successfully.",
  "data": [
    {
      "id": 1,
      "actor_type": "SUPER_ADMIN",
      "actor_id": 1,
      "action": "CREATE_DASHBOARD_USER",
      "resource": "dashboard_users",
      "resource_id": "2",
      "payload_before": null,
      "payload_after": { "id": 2, "email": "karthik@velsagro.com", "role_id": 3 },
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0 ...",
      "created_at": "2026-11-12T06:15:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 25,
    "totalPages": 1
  }
}
```

---

### 4.2 Get Login Attempts & Lockout Status
* **Endpoint**: `/api/v1/admin/login-attempts`
* **Method**: `GET`
* **Query Parameters**:
  * `page` (default: 1)
  * `limit` (default: 25)
  * `is_successful` (`true` or `false`)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login attempts retrieved successfully.",
  "data": [
    {
      "id": 1,
      "email": "hacker@test.com",
      "ip_address": "192.168.1.100",
      "user_type": "SUPER_ADMIN",
      "is_successful": 0,
      "attempted_at": "2026-11-12T06:10:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 25,
    "totalPages": 1
  }
}
```

# 🔌 API Contracts & Backend Integration Specification

This document defines the formal RESTful API contract required by the frontend application when interfacing with the companion Node.js backend located in `E:\dashborad clone\node`.

---

## 1. Global API Conventions

- **Base URL**: `/api/v1`
- **Content Type**: `application/json`
- **Authentication**: Bearer JWT token in header:
  ```http
  Authorization: Bearer <jwt_token>
  ```
- **Standard Success Response**:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { "total": 12, "page": 1, "timestamp": 1729334400000 }
  }
  ```
- **Standard Error Response**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_BATCH_STATUS",
      "message": "Cannot release expired batch."
    }
  }
  ```

---

## 2. Domain Endpoints & Schemas

### 2.1 Products (`/api/v1/products`)
| Method | Endpoint | Description | Request Body | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products` | List all active SKUs | None | `Product[]` |
| `GET` | `/products/:id` | Fetch SKU detail | None | `Product` |
| `POST` | `/products` | Create product | `Partial<Product>` | `Product` |
| `PUT` | `/products/:id` | Update product attributes | `Partial<Product>` | `Product` |
| `POST` | `/products/:id/adjust` | Manual inventory adjustment | `{ locId, qtyDelta, reason }` | `{ product, movement }` |

#### Payload Schema: `Product`
```json
{
  "id": "crb50",
  "name": "Calendula Rescue Balm",
  "size": "50 ml",
  "category": "Moisturise",
  "price": 38.00,
  "cost": 8.40,
  "stock": { "dc": 240, "lab": 35, "shop": 18 },
  "reorderAt": 80,
  "active": true,
  "photo": "balm.jpg"
}
```

---

### 2.2 Production Batches (`/api/v1/batches`)
| Method | Endpoint | Description | Request Body | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/batches` | List batches (filter by status) | Query: `?status=quarantine` | `Batch[]` |
| `POST` | `/batches` | Register new production batch | `{ productId, initialQty, lot, expiresAt }` | `Batch` |
| `PATCH` | `/batches/:id/status` | Transition QA status | `{ status: "released" \| "hold" \| "expired" }` | `Batch` |

#### Payload Schema: `Batch`
```json
{
  "id": "b-2026-104",
  "lot": "LOT-26104",
  "productId": "crb50",
  "status": "released",
  "initialQty": 200,
  "qty": 200,
  "left": 185,
  "mfgAt": 1729334400000,
  "releasedAt": 1729420800000,
  "expiresAt": 1792406400000
}
```

---

### 2.3 Sales Orders (`/api/v1/orders`)
| Method | Endpoint | Description | Request Body | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/orders` | List sales orders | Query: `?channel=wholesale&status=new` | `SalesOrder[]` |
| `GET` | `/orders/:id` | Order details & line items | None | `SalesOrder` |
| `POST` | `/orders` | Create sales order | `OrderCreationPayload` | `SalesOrder` |
| `PATCH` | `/orders/:id/status`| Transition fulfillment stage | `{ status: "picking" \| "packed" \| "shipped" }` | `SalesOrder` |
| `PATCH` | `/orders/:id/payment`| Mark order as paid | `{ paid: true }` | `SalesOrder` |

#### Payload Schema: `SalesOrder`
```json
{
  "id": "so-1082",
  "number": "SO-1082",
  "customerId": "c-blue-ridge",
  "channel": "wholesale",
  "status": "picking",
  "createdAt": 1729334400000,
  "shipBy": 1729507200000,
  "locId": "dc",
  "lines": [
    { "productId": "crb50", "qty": 12, "price": 22.80 },
    { "productId": "nia30", "qty": 12, "price": 21.60 }
  ],
  "carrier": "USPS Priority",
  "paid": true,
  "history": [
    { "at": 1729334400000, "to": "new", "by": "Sofia Ferreira" },
    { "at": 1729340000000, "to": "picking", "by": "Kwame Asante" }
  ]
}
```

---

### 2.4 Purchasing (`/api/v1/purchasing`)
| Method | Endpoint | Description | Request Body | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/purchasing/orders` | List POs | Query: `?status=sent` | `PurchaseOrder[]` |
| `POST` | `/purchasing/orders` | Create PO | `{ supplierId, lines: [{ materialId, qty, cost }] }` | `PurchaseOrder` |
| `POST` | `/purchasing/orders/:id/receive` | Receive goods into stock | `{ linesReceived: [{ materialId, qty }] }` | `PurchaseOrder` |
| `GET` | `/purchasing/suppliers` | Suppliers directory | None | `Supplier[]` |

---

### 2.5 Warehouses & Transfers (`/api/v1/warehouses`)
| Method | Endpoint | Description | Request Body | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/warehouses/locations` | List sites & bin zones | None | `Location[]` |
| `POST` | `/warehouses/transfers` | Create stock transfer | `{ fromLocId, toLocId, lines: [...] }` | `Transfer` |
| `POST` | `/warehouses/transfers/:id/receive` | Confirm transfer receipt | None | `Transfer` |
| `GET` | `/warehouses/counts` | Cycle counts | None | `CycleCount[]` |
| `POST` | `/warehouses/counts/:id/reconcile` | Commit physical count | `{ lines: [{ productId, counted }] }` | `CycleCount` |

---

### 2.6 Analytics & Reports (`/api/v1/analytics`)
| Method | Endpoint | Description | Query Parameters | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/analytics/overview` | High-level financial KPIs | `?range=month` | Revenue, Margin, Units sold |
| `GET` | `/analytics/valuation` | Stock inventory valuation | `?breakdown=category` | Valuation by SKU & cost |
| `GET` | `/analytics/export/:type` | CSV data streaming | `:type = stock \| orders \| moves` | `text/csv` stream |

---

## 3. Error Code Matrix

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `AUTH_EXPIRED` | 401 | JWT session has expired. Re-authenticate. |
| `FORBIDDEN_ROLE` | 403 | User role lacks write permission (e.g. Viewer trying to release batch). |
| `INSUFFICIENT_STOCK` | 409 | Requested order quantity exceeds stock on hand in the specified location. |
| `INVALID_TRANSITION` | 422 | Attempted invalid order/batch state transition (e.g. `delivered` -> `new`). |
| `RESOURCE_NOT_FOUND` | 404 | Entity ID not found in database. |

# Kitchen API Documentation

Base URL: `https://kitchen-api-329u.onrender.com/api`

Published Postman doc: `https://documenter.getpostman.com/view/11384363/2sBXVcmYWv`

All endpoints return JSON responses.

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained through the authentication endpoints (`/customers/auth` or `/vendors/auth`).

## Response Format

### Success Response

```json
{
  "status": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": false,
  "message": "Error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

---

## Customer Endpoints

### Create Customer

**POST** `/api/customers`

**Auth Required**: No

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "status": true,
  "message": "Customer created successfully",
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation Rules**:
- `first_name`: string, required
- `last_name`: string, required
- `email`: valid email, required
- `password`: string, minimum 8 characters, required

---

### Authenticate Customer

**POST** `/api/customers/auth`

**Auth Required**: No

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "status": true,
  "message": "Customer authenticated successfully",
  "data": {
    "customer": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get All Customers

**GET** `/api/customers`

**Auth Required**: No

**Response** (200):
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    }
  ],
  "message": "Customers fetched successfully"
}
```

---

### Get Current Customer

**GET** `/api/customers/me`

**Auth Required**: Yes (Customer token)

**Response** (200):
```json
{
  "status": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "message": "Customer fetched successfully"
}
```

---

### Update Customer

**PUT** `/api/customers/me`

**Auth Required**: Yes (Customer token)

**Request Body**:
```json
{
  "first_name": "Jane",
  "last_name": "Smith"
}
```

**Response** (200):
```json
{
  "status": true,
  "data": {
    "id": 1,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "john@example.com"
  },
  "message": "Customer updated successfully"
}
```

**Validation Rules**:
- `first_name`: string, optional
- `last_name`: string, optional

---

## Vendor Endpoints

### Create Vendor

**POST** `/api/vendors`

**Auth Required**: No

**Request Body**:
```json
{
  "name": "Pizza Palace",
  "email": "pizza@palace.com",
  "password": "password123",
  "address": "123 Main St",
  "phone": "555-0101"
}
```

**Response** (201):
```json
{
  "status": true,
  "message": "Vendor created successfully",
  "data": {
    "id": 1,
    "name": "Pizza Palace",
    "email": "pizza@palace.com",
    "address": "123 Main St",
    "phone": "555-0101",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation Rules**:
- `name`: string, required
- `email`: valid email, required
- `password`: string, minimum 8 characters, required
- `address`: string, optional
- `phone`: string, optional

---

### Authenticate Vendor

**POST** `/api/vendors/auth`

**Auth Required**: No

**Request Body**:
```json
{
  "email": "pizza@palace.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "status": true,
  "message": "Vendor authenticated successfully",
  "data": {
    "vendor": {
      "id": 1,
      "name": "Pizza Palace",
      "email": "pizza@palace.com",
      "address": "123 Main St",
      "phone": "555-0101"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get All Vendors

**GET** `/api/vendors`

**Auth Required**: No

**Response** (200):
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "email": "pizza@palace.com",
      "address": "123 Main St",
      "phone": "555-0101"
    }
  ],
  "message": "Vendors fetched successfully"
}
```

---

### Get Vendor by ID

**GET** `/api/vendors/:id`

**Auth Required**: No

**Response** (200):
```json
{
  "status": true,
  "data": {
    "id": 1,
    "name": "Pizza Palace",
    "email": "pizza@palace.com",
    "address": "123 Main St",
    "phone": "555-0101"
  },
  "message": "Vendor fetched successfully"
}
```

---

### Update Vendor

**PUT** `/api/vendors/:id`

**Auth Required**: Yes (Vendor token)

**Request Body**:
```json
{
  "name": "Updated Pizza Palace",
  "address": "456 New St",
  "phone": "555-0202"
}
```

**Response** (200):
```json
{
  "status": true,
  "data": {
    "id": 1,
    "name": "Updated Pizza Palace",
    "email": "pizza@palace.com",
    "address": "456 New St",
    "phone": "555-0202"
  },
  "message": "Vendor updated successfully"
}
```

**Validation Rules**:
- `name`: string, optional
- `address`: string, optional
- `phone`: string, optional

---

## Menu Item Endpoints

### Create Menu Items

**POST** `/api/menu-items`

**Auth Required**: Yes (Vendor token)

**Request Body** (Array of menu items):
```json
[
  {
    "name": "Margherita Pizza",
    "description": "Classic pizza with fresh mozzarella and basil",
    "price": 1800,
    "image": "https://example.com/images/margherita.jpg"
  },
  {
    "name": "Pepperoni Pizza",
    "description": "Traditional pizza with pepperoni",
    "price": 2000,
    "image": "https://example.com/images/pepperoni.jpg"
  }
]
```

**Response** (201):
```json
{
  "status": true,
  "message": "MenuItems created successfully",
  "data": [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "description": "Classic pizza with fresh mozzarella and basil",
      "price": 1800,
      "image": "https://example.com/images/margherita.jpg",
      "vendor_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Validation Rules**:
- Array of objects, required
- Each object:
  - `name`: string, required
  - `description`: string, required
  - `price`: number, positive, required (in lowest units, e.g., cents)
  - `image`: valid URL, required

---

### Get Vendor Menu Items

**GET** `/api/menu-items?vendor_id=1&page=1&limit=10`

**Auth Required**: No (or Vendor token for own items)

**Query Parameters**:
- `vendor_id`: number, required (unless authenticated vendor)
- `page`: number, optional (default: 1)
- `limit`: number, optional (default: 10, max: 100)

**Response** (200):
```json
{
  "status": true,
  "message": "Menu items fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "description": "Classic pizza with fresh mozzarella and basil",
      "price": 1800,
      "image": "https://example.com/images/margherita.jpg",
      "vendor_id": 1
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Note**: If authenticated as a vendor, you can omit `vendor_id` to get your own menu items.

---

### Get Menu Item by ID

**GET** `/api/menu-items/:id`

**Auth Required**: No

**Response** (200):
```json
{
  "status": true,
  "message": "Menu item fetched successfully",
  "data": {
    "id": 1,
    "name": "Margherita Pizza",
    "description": "Classic pizza with fresh mozzarella and basil",
    "price": 1800,
    "image": "https://example.com/images/margherita.jpg",
    "vendor_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Menu Item

**PUT** `/api/menu-items/:id`

**Auth Required**: Yes (Vendor token + ownership)

**Request Body**:
```json
{
  "name": "Updated Pizza Name",
  "price": 2000,
  "description": "Updated description"
}
```

**Response** (200):
```json
{
  "status": true,
  "message": "Menu item updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Pizza Name",
    "description": "Updated description",
    "price": 2000,
    "image": "https://example.com/images/margherita.jpg",
    "vendor_id": 1
  }
}
```

**Validation Rules**:
- `name`: string, optional
- `description`: string, optional
- `price`: number, positive, optional
- `image`: valid URL, optional

**Error Responses**:
- `403 Forbidden` - Vendor does not own the menu item
- `404 Not Found` - Menu item does not exist

---

### Delete Menu Item

**DELETE** `/api/menu-items/:id`

**Auth Required**: Yes (Vendor token + ownership)

**Response** (200):
```json
{
  "status": true,
  "message": "Menu item deleted successfully"
}
```

**Error Responses**:
- `403 Forbidden` - Vendor does not own the menu item
- `404 Not Found` - Menu item does not exist

---

## Error Examples

### Validation Error (400)
```json
{
  "status": false,
  "message": "email is required"
}
```

### Unauthorized (401)
```json
{
  "status": false,
  "message": "No token provided"
}
```

### Forbidden (403)
```json
{
  "status": false,
  "message": "You do not have permission to access this menu item"
}
```

### Not Found (404)
```json
{
  "status": false,
  "message": "Menu item not found"
}
```

### Conflict (409)
```json
{
  "status": false,
  "message": "Customer already exists"
}
```


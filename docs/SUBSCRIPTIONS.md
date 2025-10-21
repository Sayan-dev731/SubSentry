# Subscription API Reference

This document provides examples for using the SubSentry subscription endpoints.

## Subscription Endpoints

**Base Path:** `/api/subscriptions`

**Authentication:** All endpoints require a valid JWT token in the Authorization header.

**User Scoping:** All operations are automatically scoped to the authenticated user (`req.user.userId`).

---

### 1. Get All Subscriptions

**Endpoint:** `GET /api/subscriptions`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 2,
    "subscriptions": [
      {
        "id": 1,
        "user_id": 1,
        "name": "Netflix",
        "renewal_date": "2025-11-15",
        "cost": 15.99,
        "reminder_offset_days": 7,
        "created_at": "2025-10-20T12:00:00.000Z",
        "updated_at": "2025-10-20T12:00:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "name": "Spotify",
        "renewal_date": "2025-11-20",
        "cost": 9.99,
        "reminder_offset_days": 3,
        "created_at": "2025-10-20T12:05:00.000Z",
        "updated_at": "2025-10-20T12:05:00.000Z"
      }
    ]
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 2. Create a New Subscription

**Endpoint:** `POST /api/subscriptions`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Netflix Premium",
  "renewal_date": "2025-12-01",
  "cost": 15.99,
  "reminder_offset_days": 7
}
```

**Field Descriptions:**
- `name` (string, required) - Name of the subscription
- `renewal_date` (date string, required) - Next renewal date (YYYY-MM-DD)
- `cost` (number, required) - Subscription cost (positive number)
- `reminder_offset_days` (integer, optional) - Days before renewal to send reminder (default: 7)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "subscription": {
      "id": 3,
      "user_id": 1,
      "name": "Netflix Premium",
      "renewal_date": "2025-12-01",
      "cost": 15.99,
      "reminder_offset_days": 7,
      "created_at": "2025-10-20T12:10:00.000Z",
      "updated_at": "2025-10-20T12:10:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Netflix Premium",
    "renewal_date": "2025-12-01",
    "cost": 15.99,
    "reminder_offset_days": 7
  }'
```

---

### 3. Get Subscription by ID

**Endpoint:** `GET /api/subscriptions/:id`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**URL Parameters:**
- `id` (integer) - Subscription ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "user_id": 1,
      "name": "Netflix",
      "renewal_date": "2025-11-15",
      "cost": 15.99,
      "reminder_offset_days": 7,
      "created_at": "2025-10-20T12:00:00.000Z",
      "updated_at": "2025-10-20T12:00:00.000Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Subscription not found",
  "message": "The requested subscription does not exist or you do not have access to it"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/subscriptions/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 4. Update Subscription

**Endpoint:** `PUT /api/subscriptions/:id`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (integer) - Subscription ID

**Request Body (all fields optional):**
```json
{
  "name": "Netflix Basic",
  "renewal_date": "2025-12-15",
  "cost": 9.99,
  "reminder_offset_days": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "subscription": {
      "id": 1,
      "user_id": 1,
      "name": "Netflix Basic",
      "renewal_date": "2025-12-15",
      "cost": 9.99,
      "reminder_offset_days": 3,
      "created_at": "2025-10-20T12:00:00.000Z",
      "updated_at": "2025-10-20T12:15:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/subscriptions/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Netflix Basic",
    "cost": 9.99
  }'
```

---

### 5. Delete Subscription

**Endpoint:** `DELETE /api/subscriptions/:id`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**URL Parameters:**
- `id` (integer) - Subscription ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription deleted successfully",
  "data": {
    "deleted_subscription": {
      "id": 1,
      "user_id": 1,
      "name": "Netflix",
      "renewal_date": "2025-11-15",
      "cost": 15.99
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Subscription not found",
  "message": "The requested subscription does not exist or you do not have access to it"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/subscriptions/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## User Scoping & Security

### How User Scoping Works

All subscription operations are automatically scoped to the authenticated user:

1. **Authentication Middleware** (`authenticate`) extracts the user ID from the JWT token
2. **Controller Methods** use `req.user.userId` to scope all database queries
3. **Model Methods** include `user_id` in WHERE clauses to ensure data isolation

### Authorization Flow

```
Request → authenticate middleware → Extract userId from JWT
    ↓
Controller → Pass userId to Model method
    ↓
Model → Query with WHERE user_id = $userId
    ↓
Response → Only user's own data returned
```

### Security Features

- ✅ **Token Required:** All endpoints require valid JWT authentication
- ✅ **User Isolation:** Users can only access their own subscriptions
- ✅ **Input Validation:** All inputs are validated before database operations
- ✅ **Error Handling:** Unauthorized access returns 404 (not 403) to prevent information leakage
- ✅ **Type Safety:** IDs and costs are validated for correct types

---

## Error Responses

### 400 Bad Request - Missing Required Fields
```json
{
  "success": false,
  "error": "Missing required fields",
  "message": "Name, renewal_date, and cost are required"
}
```

### 400 Bad Request - Invalid Cost
```json
{
  "success": false,
  "error": "Invalid cost",
  "message": "Cost must be a positive number"
}
```

### 400 Bad Request - Invalid Date
```json
{
  "success": false,
  "error": "Invalid date",
  "message": "Renewal date must be a valid date"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "No token provided. Please include a Bearer token in the Authorization header"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Subscription not found",
  "message": "The requested subscription does not exist or you do not have access to it"
}
```

---

## JavaScript/Fetch Examples

### Get All Subscriptions
```javascript
const getSubscriptions = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/subscriptions', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data.subscriptions;
};
```

### Create Subscription
```javascript
const createSubscription = async (subscriptionData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(subscriptionData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    return data.data.subscription;
  }
  
  throw new Error(data.message);
};

// Usage
createSubscription({
  name: 'Netflix',
  renewal_date: '2025-12-01',
  cost: 15.99,
  reminder_offset_days: 7
});
```

### Update Subscription
```javascript
const updateSubscription = async (id, updates) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3000/api/subscriptions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  
  const data = await response.json();
  return data.data.subscription;
};
```

### Delete Subscription
```javascript
const deleteSubscription = async (id) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3000/api/subscriptions/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.success;
};
```

---

## Testing the API

### 1. Register and Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Save the token from the response
TOKEN="your_token_here"
```

### 2. Create a Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Netflix",
    "renewal_date": "2025-12-01",
    "cost": 15.99,
    "reminder_offset_days": 7
  }'
```

### 3. Get All Subscriptions
```bash
curl -X GET http://localhost:3000/api/subscriptions \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Update Subscription
```bash
curl -X PUT http://localhost:3000/api/subscriptions/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"cost": 12.99}'
```

### 5. Delete Subscription
```bash
curl -X DELETE http://localhost:3000/api/subscriptions/1 \
  -H "Authorization: Bearer $TOKEN"
```

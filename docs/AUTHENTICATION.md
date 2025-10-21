# Authentication API Reference

This document provides examples for using the SubSentry authentication endpoints.

## Authentication Endpoints

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "created_at": "2025-10-20T12:00:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123"}'
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "created_at": "2025-10-20T12:00:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123"}'
```

---

### 3. Get Current User (Protected)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "created_at": "2025-10-20T12:00:00.000Z",
      "updated_at": "2025-10-20T12:00:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 4. Change Password (Protected)

**Endpoint:** `PUT /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "securePassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"currentPassword":"securePassword123","newPassword":"newSecurePassword456"}'
```

---

### 5. Logout (Protected)

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "note": "Please remove the token from client storage"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields",
  "message": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid token. Please provide a valid authentication token"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "User already exists",
  "message": "An account with this email already exists"
}
```

---

## Using Authentication in Client Applications

### JavaScript/Fetch Example

```javascript
// Register
const register = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token in localStorage
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
  
  throw new Error(data.message);
};

// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
  
  throw new Error(data.message);
};

// Make authenticated request
const getUser = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data.user;
};

// Logout
const logout = () => {
  localStorage.removeItem('token');
};
```

---

## Password Requirements

- Minimum 8 characters
- No special character or complexity requirements (can be enhanced)

## Token Information

- **Type:** JWT (JSON Web Token)
- **Default Expiration:** 7 days
- **Storage:** Client-side (localStorage, sessionStorage, or cookies)
- **Format:** `Bearer <token>` in Authorization header

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (use httpOnly cookies for web apps)
3. **Never log tokens** or expose them in URLs
4. **Implement token refresh** for long-lived sessions
5. **Add rate limiting** to prevent brute force attacks
6. **Validate all inputs** on both client and server
7. **Use strong JWT secrets** (generate with: `openssl rand -base64 32`)

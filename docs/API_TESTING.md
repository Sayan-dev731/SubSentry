# API Testing Guide

This guide provides examples for testing all SubSentry API endpoints.

## Prerequisites
- Server running on `http://localhost:3000`
- MongoDB connected and running
- Tool for making HTTP requests (curl, Postman, or Thunder Client)

## Base URL
```
http://localhost:3000
```

## Testing Workflow

### 1. Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "success": true,
  "status": "OK",
  "message": "SubSentry API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@example.com\", \"password\": \"SecurePass123!\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token for subsequent requests!**

### 3. Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@example.com\", \"password\": \"SecurePass123!\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Get Current User Profile
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "test@example.com",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

### 5. Change Password
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"currentPassword\": \"SecurePass123!\", \"newPassword\": \"NewSecurePass456!\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 6. Create a Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Netflix\", \"renewal_date\": \"2024-02-15\", \"cost\": 15.99, \"reminder_offset_days\": 7}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "subscription": {
      "id": "507f1f77bcf86cd799439012",
      "user_id": "507f1f77bcf86cd799439011",
      "name": "Netflix",
      "renewal_date": "2024-02-15T00:00:00.000Z",
      "cost": 15.99,
      "reminder_offset_days": 7,
      "created_at": "2024-01-15T10:05:00.000Z",
      "updated_at": "2024-01-15T10:05:00.000Z"
    }
  }
}
```

### 7. Get All User Subscriptions
```bash
curl http://localhost:3000/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": "507f1f77bcf86cd799439012",
        "user_id": "507f1f77bcf86cd799439011",
        "name": "Netflix",
        "renewal_date": "2024-02-15T00:00:00.000Z",
        "cost": 15.99,
        "reminder_offset_days": 7,
        "created_at": "2024-01-15T10:05:00.000Z",
        "updated_at": "2024-01-15T10:05:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### 8. Get Specific Subscription by ID
```bash
curl http://localhost:3000/api/subscriptions/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "507f1f77bcf86cd799439012",
      "user_id": "507f1f77bcf86cd799439011",
      "name": "Netflix",
      "renewal_date": "2024-02-15T00:00:00.000Z",
      "cost": 15.99,
      "reminder_offset_days": 7,
      "created_at": "2024-01-15T10:05:00.000Z",
      "updated_at": "2024-01-15T10:05:00.000Z"
    }
  }
}
```

### 9. Update a Subscription
```bash
curl -X PUT http://localhost:3000/api/subscriptions/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Netflix Premium\", \"cost\": 19.99}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "subscription": {
      "id": "507f1f77bcf86cd799439012",
      "user_id": "507f1f77bcf86cd799439011",
      "name": "Netflix Premium",
      "renewal_date": "2024-02-15T00:00:00.000Z",
      "cost": 19.99,
      "reminder_offset_days": 7,
      "created_at": "2024-01-15T10:05:00.000Z",
      "updated_at": "2024-01-15T10:10:00.000Z"
    }
  }
}
```

### 10. Get Subscription Statistics
```bash
curl http://localhost:3000/api/subscriptions/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_subscriptions": 5,
      "total_cost": 89.95,
      "average_cost": 17.99,
      "next_renewal_date": "2024-02-01T00:00:00.000Z",
      "last_renewal_date": "2024-06-15T00:00:00.000Z"
    }
  }
}
```

### 11. Delete a Subscription
```bash
curl -X DELETE http://localhost:3000/api/subscriptions/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription deleted successfully",
  "data": {
    "subscription": {
      "id": "507f1f77bcf86cd799439012",
      "user_id": "507f1f77bcf86cd799439011",
      "name": "Netflix Premium",
      "renewal_date": "2024-02-15T00:00:00.000Z",
      "cost": 19.99
    }
  }
}
```

### 12. Logout User
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Common Error Responses

### 401 Unauthorized (Missing Token)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Access token is required"
}
```

### 401 Unauthorized (Invalid Token)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Email is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Subscription not found"
}
```

### 409 Conflict (Duplicate Email)
```json
{
  "success": false,
  "error": "Conflict",
  "message": "Email already registered"
}
```

## Testing with PowerShell (Windows)

For Windows users, use `Invoke-RestMethod`:

```powershell
# Health Check
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get

# Register User
$body = @{
    email = "test@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $body -ContentType "application/json"

# Login and Save Token
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.token

# Create Subscription with Token
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}
$subBody = @{
    name = "Netflix"
    renewal_date = "2024-02-15"
    cost = 15.99
    reminder_offset_days = 7
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/subscriptions" -Method Post -Headers $headers -Body $subBody

# Get All Subscriptions
Invoke-RestMethod -Uri "http://localhost:3000/api/subscriptions" -Method Get -Headers $headers
```

## Testing with Postman

1. Create a new Postman collection named "SubSentry API"
2. Add an environment variable `baseUrl` = `http://localhost:3000`
3. Create a variable `authToken` to store JWT token
4. After login, add this test script:
   ```javascript
   pm.environment.set("authToken", pm.response.json().data.token);
   ```
5. In protected endpoints, set header:
   - Key: `Authorization`
   - Value: `Bearer {{authToken}}`

## VS Code Thunder Client

1. Install Thunder Client extension
2. Import collection from `thunder-collection.json` (if available)
3. Or create requests manually following the curl examples above
4. Use environment variables for `baseUrl` and `token`

## Automated Testing Script

Save this as `test-api.ps1` (PowerShell) or `test-api.sh` (Bash):

```powershell
# test-api.ps1
$baseUrl = "http://localhost:3000"
$email = "test-$(Get-Random)@example.com"
$password = "SecurePass123!"

Write-Host "Testing SubSentry API..." -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[1/5] Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$baseUrl/health"
Write-Host "✓ Server is running" -ForegroundColor Green

# Test 2: Register User
Write-Host "`n[2/5] Registering user..." -ForegroundColor Yellow
$registerBody = @{ email = $email; password = $password } | ConvertTo-Json
$register = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
$token = $register.data.token
Write-Host "✓ User registered: $email" -ForegroundColor Green

# Test 3: Create Subscription
Write-Host "`n[3/5] Creating subscription..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
$subBody = @{ name = "Test Subscription"; renewal_date = "2024-12-31"; cost = 9.99; reminder_offset_days = 7 } | ConvertTo-Json
$sub = Invoke-RestMethod -Uri "$baseUrl/api/subscriptions" -Method Post -Headers $headers -Body $subBody
$subId = $sub.data.subscription.id
Write-Host "✓ Subscription created: $subId" -ForegroundColor Green

# Test 4: Get Subscriptions
Write-Host "`n[4/5] Getting subscriptions..." -ForegroundColor Yellow
$subs = Invoke-RestMethod -Uri "$baseUrl/api/subscriptions" -Method Get -Headers $headers
Write-Host "✓ Found $($subs.data.count) subscription(s)" -ForegroundColor Green

# Test 5: Delete Subscription
Write-Host "`n[5/5] Deleting subscription..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/api/subscriptions/$subId" -Method Delete -Headers $headers
Write-Host "✓ Subscription deleted" -ForegroundColor Green

Write-Host "`nAll tests passed! ✓" -ForegroundColor Green
```

Run with: `.\test-api.ps1`

## Notes

- Replace `YOUR_TOKEN_HERE` with actual JWT token from login/register response
- Replace `507f1f77bcf86cd799439012` with actual subscription IDs
- Tokens expire after 7 days by default (configurable in `.env`)
- All dates should be in ISO 8601 format (YYYY-MM-DD or full timestamp)
- MongoDB ObjectIds are 24-character hexadecimal strings

## Troubleshooting

### Cannot connect to server
- Check if server is running: `npm run dev`
- Verify port 3000 is not in use: `netstat -ano | findstr :3000`

### MongoDB connection failed
- Ensure MongoDB is running: `net start MongoDB` (Windows)
- Check `MONGODB_URI` in `.env` file
- Verify MongoDB is listening on port 27017

### Invalid token errors
- Token may have expired (default: 7 days)
- Login again to get a fresh token
- Check `JWT_SECRET` matches across restarts

### Subscription not found
- Verify the subscription ID is correct (24-character hex string)
- Ensure the subscription belongs to the authenticated user
- Check if subscription was deleted

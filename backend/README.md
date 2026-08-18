# Uber Clone Backend API Documentation

## User Registration Endpoint

### Endpoint Description
This endpoint allows users to register a new account in the Uber Clone application. It validates user input, hashes the password, creates a new user record in the database, and returns an authentication token.

---

## POST `/users/register`

### Request Method
```
POST
```

### Endpoint Path
```
/users/register
```

### Description
Registers a new user and generates an authentication token for immediate login.

---

## Request Body

### Content-Type
```
application/json
```

### Required Fields

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `email` | String | Must be a valid email format | User's email address (unique in database) |
| `fullname.firstname` | String | Minimum 3 characters | User's first name |
| `fullname.lastname` | String | Minimum 3 characters (optional) | User's last name |
| `password` | String | Minimum 6 characters | User's password (will be hashed with bcrypt) |

### Example Request
```json
{
  "email": "john.doe@example.com",
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "password": "password123"
}
```

---

## Response

### Success Response

**Status Code:** `201 Created`

**Response Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
  }
}
```

**Description:** User successfully registered. The response includes:
- `token`: JWT authentication token for the user
- `user`: User object with registration details

---

### Error Responses

#### Validation Error

**Status Code:** `400 Bad Request`

**Response Body (Example):**
```json
{
  "errors": [
    {
      "value": "invalid-email",
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    },
    {
      "value": "ab",
      "msg": "Fisrt name must be at least 3 character long",
      "param": "fullname.firstname",
      "location": "body"
    },
    {
      "value": "12345",
      "msg": "Password must be at least 6 character long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

**Validation Rules:**
- Invalid Email: Email format is incorrect
- First name: Must be at least 3 characters long
- Password: Must be at least 6 characters long

---

## Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| `email` | Valid email format | "Invalid Email" |
| `fullname.firstname` | Minimum 3 characters | "Fisrt name must be at least 3 character long" |
| `password` | Minimum 6 characters | "Password must be at least 6 character long" |

---

## POST `/users/login`

### Request Method
```
POST
```

### Endpoint Path
```
/users/login
```

### Description
Authenticates an existing user by verifying email and password credentials. Returns a JWT authentication token upon successful login.

---

## Request Body

### Content-Type
```
application/json
```

### Required Fields

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `email` | String | Must be a valid email format | User's registered email address |
| `password` | String | Minimum 6 characters | User's password (will be compared with hashed password in database) |

### Example Request
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

---

## Response

### Success Response

**Status Code:** `200 OK`

**Response Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
  }
}
```

**Description:** User successfully authenticated. The response includes:
- `token`: JWT authentication token for the user
- `user`: User object with login details

---

### Error Responses

#### Validation Error

**Status Code:** `400 Bad Request`

**Response Body (Example):**
```json
{
  "errors": [
    {
      "value": "invalid-email",
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    },
    {
      "value": "12345",
      "msg": "Password must be at least 6 character long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

**Validation Rules:**
- Invalid Email: Email format is incorrect
- Password: Must be at least 6 characters long

---

#### Authentication Error

**Status Code:** `401 Unauthorized`

**Response Body:**
```json
{
  "message": "Invalid email or password"
}
```

**Reasons:**
- Email does not exist in database
- Password does not match the hashed password in database
- User account has been deleted

---

## Login Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| `email` | Valid email format | "Invalid Email" |
| `password` | Minimum 6 characters | "Password must be at least 6 character long" |

---

## Login Response Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| `200` | OK | Login successful, token and user data returned |
| `400` | Bad Request | Validation error in request body |
| `401` | Unauthorized | Invalid email or password |

---

## Technical Details (Login)

### Password Security
- Passwords are hashed using **bcrypt** with a salt round of 10
- Original password is never stored in the database
- Hashing is performed before user creation (register)
- Password comparison during login uses bcrypt's `compare()` method for secure verification

### Authentication
- JWT (JSON Web Token) is generated upon successful registration and login
- Token includes user ID (`_id`) and is signed with `JWT_SECRET` environment variable
- Token can be used for subsequent authenticated requests in Authorization header
- Password field is excluded from user queries by default (`select: false`) and only fetched when needed for login verification

### Database
- Uses **MongoDB** with Mongoose ODM
- User email is stored as unique index (prevents duplicate emails)
- User schema includes optional `socketId` field for real-time socket connections

---

## Code Flow

### Registration Flow
1. Express validator middleware validates request body
2. If validation fails, return `400` status with error details
3. If validation passes, controller receives request
4. Password is hashed using `bcrypt`
5. User service creates new user document in MongoDB
6. JWT token is generated from user ID
7. Return `201` status with token and user object

### Login Flow
1. Express validator middleware validates request body
2. If validation fails, return `400` status with error details
3. If validation passes, controller receives request
4. Query database for user by email (including password field)
5. If user not found, return `401` Unauthorized
6. Compare provided password with stored hashed password using bcrypt
7. If password doesn't match, return `401` Unauthorized
8. If password matches, generate JWT token from user ID
9. Return `200` status with token and user object (password excluded)

### Profile Flow
1. Authentication middleware verifies JWT token from Authorization header
2. If token is missing or invalid, return `401` Unauthorized
3. If token is valid, extract user ID from token
4. Query database for user by ID
5. Return `200` status with user profile data (password excluded)

### Logout Flow
1. Authentication middleware verifies JWT token from Authorization header
2. If token is missing or invalid, return `401` Unauthorized
3. If token is valid, clear user session (typically invalidate token on client)
4. Return `200` status with success message

---

## Environment Variables Required

```env
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
```

---

## Example Usage

### Registration

#### cURL
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "password": "password123"
  }'
```

#### JavaScript (Fetch API)
```javascript
fetch('http://localhost:3000/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    fullname: {
      firstname: 'John',
      lastname: 'Doe'
    },
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

---

### Login

#### cURL
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

#### JavaScript (Fetch API)
```javascript
fetch('http://localhost:3000/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

---

### Get Profile

#### cURL
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### JavaScript (Fetch API)
```javascript
const token = localStorage.getItem('authToken'); // Token from login/register

fetch('http://localhost:3000/users/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

---

### Logout

#### cURL
```bash
curl -X GET http://localhost:3000/users/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### JavaScript (Fetch API)
```javascript
const token = localStorage.getItem('authToken'); // Token from login/register

fetch('http://localhost:3000/users/logout', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data);
  localStorage.removeItem('authToken'); // Clear token from storage
});
```

---

## GET `/users/profile`

### Request Method
```
GET
```

### Endpoint Path
```
/users/profile
```

### Description
Retrieves the authenticated user's profile information. Requires valid JWT token in Authorization header.

---

## Request Headers

| Header | Value | Description |
|--------|-------|-------------|
| `Authorization` | `Bearer <token>` | JWT token obtained from register or login endpoint |

### Example Request
```
GET /users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Response

### Success Response

**Status Code:** `200 OK`

**Response Body:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "socketId": null
}
```

**Description:** User profile retrieved successfully. Returns the authenticated user's details without the password field.

---

### Error Responses

#### Missing Authorization Header

**Status Code:** `401 Unauthorized`

**Response Body:**
```json
{
  "message": "Unauthorized"
}
```

**Reasons:**
- Authorization header is missing
- Token is not provided

---

#### Invalid or Expired Token

**Status Code:** `401 Unauthorized`

**Response Body:**
```json
{
  "message": "Unauthorized"
}
```

**Reasons:**
- JWT token is invalid
- JWT token has expired
- JWT token signature is tampered with

---

## Profile Response Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| `200` | OK | Profile retrieved successfully |
| `401` | Unauthorized | Missing, invalid, or expired token |

---

## GET `/users/logout`

### Request Method
```
GET
```

### Endpoint Path
```
/users/logout
```

### Description
Logs out an authenticated user by clearing the user session. Requires valid JWT token in Authorization header.

---

## Request Headers

| Header | Value | Description |
|--------|-------|-------------|
| `Authorization` | `Bearer <token>` | JWT token obtained from register or login endpoint |

### Example Request
```
GET /users/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Response

### Success Response

**Status Code:** `200 OK`

**Response Body:**
```json
{
  "message": "User logged out successfully"
}
```

**Description:** User successfully logged out. Session is cleared and token is invalidated.

---

### Error Responses

#### Missing Authorization Header

**Status Code:** `401 Unauthorized`

**Response Body:**
```json
{
  "message": "Unauthorized"
}
```

**Reasons:**
- Authorization header is missing
- Token is not provided

---

#### Invalid or Expired Token

**Status Code:** `401 Unauthorized`

**Response Body:**
```json
{
  "message": "Unauthorized"
}
```

**Reasons:**
- JWT token is invalid
- JWT token has expired
- JWT token signature is tampered with

---

## Logout Response Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| `200` | OK | Logout successful |
| `401` | Unauthorized | Missing, invalid, or expired token |

---

## Notes

### General Notes
- Email addresses must be unique; registering with an existing email will result in a database error
- Last name is optional during registration but if provided must be at least 3 characters
- Passwords are case-sensitive
- Both registration and login endpoints exclude the password field from the response for security reasons (except during password verification)

### Authentication & Authorization
- The returned JWT token should be stored on the client side (localStorage, sessionStorage, or cookies)
- The token must be included in the `Authorization` header as `Bearer <token>` for authenticated endpoints
- The `/users/profile` and `/users/logout` endpoints require valid authentication
- If token is missing, invalid, or expired, authenticated endpoints return `401 Unauthorized`
- Tokens are signed with `JWT_SECRET` environment variable and include the user's ID

### Login Security
- Login will fail if the user has not registered with the provided email address
- Login will fail if the password does not match (even if email exists)
- Generic error message "Invalid email or password" is used to prevent email enumeration attacks

### Logout Behavior
- Logout clears the server-side session for the user
- Clients must also remove the token from local storage after logout
- After logout, any requests using the old token will be rejected

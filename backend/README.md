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

## Technical Details

### Password Security
- Passwords are hashed using **bcrypt** with a salt round of 10
- Original password is never stored in the database
- Hashing is performed before user creation

### Authentication
- JWT (JSON Web Token) is generated upon successful registration
- Token includes user ID (`_id`) and is signed with `JWT_SECRET` environment variable
- Token can be used for subsequent authenticated requests

### Database
- Uses **MongoDB** with Mongoose ODM
- User email is stored as unique index (prevents duplicate emails)
- User schema includes optional `socketId` field for real-time socket connections

---

## Code Flow

1. Express validator middleware validates request body
2. If validation fails, return `400` status with error details
3. If validation passes, controller receives request
4. Password is hashed using `bcrypt`
5. User service creates new user document in MongoDB
6. JWT token is generated from user ID
7. Return `201` status with token and user object

---

## Environment Variables Required

```env
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
```

---

## Example Usage

### cURL
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

### JavaScript (Fetch API)
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

## Notes

- Email addresses must be unique; registering with an existing email will result in a database error
- Last name is optional but if provided must be at least 3 characters
- Passwords are case-sensitive
- The returned JWT token should be stored on the client side and included in the Authorization header for subsequent API requests

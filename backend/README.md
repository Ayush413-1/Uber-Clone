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

---

## POST `/captains/register`

### Request Method
```
POST
```

### Endpoint Path
```
/captains/register
```

### Description
Registers a new captain (driver) account in the Uber Clone application. Validates user and vehicle information, hashes the password, creates a new captain record in the database, and returns an authentication token.

---

## Request Body

### Content-Type
```
application/json
```

### Required Fields

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `email` | String | Must be a valid email format | Captain's email address (unique in database) |
| `fullname.firstname` | String | Minimum 3 characters | Captain's first name |
| `fullname.lastname` | String | Minimum 3 characters (optional) | Captain's last name |
| `password` | String | Minimum 6 characters | Captain's password (will be hashed with bcrypt) |
| `vehicle.color` | String | Minimum 3 characters | Vehicle color (e.g., "Red", "Blue", "Black") |
| `vehicle.plate` | String | Minimum 3 characters | Vehicle license plate number (unique identifier) |
| `vehicle.capacity` | Number | Minimum 1 | Number of passengers (e.g., 1, 2, 4, 5, 7) |
| `vehicle.vehicleType` | String | Must be 'car', 'motorcycle', or 'auto' | Type of vehicle for categorization |

### Example Request
```json
{
  "email": "captain.john@example.com",
  "fullname": {
    "firstname": "John",
    "lastname": "Smith"
  },
  "password": "securePassword123",
  "vehicle": {
    "color": "Black",
    "plate": "DL-01-AB-1234",
    "capacity": 4,
    "vehicleType": "car"
  }
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
  "captain": {
    "_id": "507f1f77bcf86cd799439012",
    "fullname": {
      "firstname": "John",
      "lastname": "Smith"
    },
    "email": "captain.john@example.com",
    "socketId": null,
    "status": "inactive",
    "vehicle": {
      "color": "Black",
      "plate": "DL-01-AB-1234",
      "capacity": 4,
      "vehicleType": "car"
    },
    "location": {
      "lat": null,
      "lng": null
    }
  }
}
```

**Description:** Captain successfully registered. The response includes:
- `token`: JWT authentication token for the captain (expires in 24 hours)
- `captain`: Captain object with registration and vehicle details
- `status`: Initially set to "inactive" (captain is offline)
- `location`: Initially null, updated when captain comes online

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
      "value": "Red",
      "msg": "Color must be at least 3 characters long",
      "param": "vehicle.color",
      "location": "body"
    },
    {
      "value": "motorcycle",
      "msg": "Invalid type",
      "param": "vehicle.vehicleType",
      "location": "body"
    }
  ]
}
```

**Validation Rules:**
- Invalid Email: Email format is incorrect
- First name: Must be at least 3 characters long
- Password: Must be at least 6 characters long
- Vehicle color: Must be at least 3 characters long
- Vehicle plate: Must be at least 3 characters long
- Vehicle capacity: Must be an integer with minimum value of 1
- Vehicle type: Must be one of: 'car', 'motorcycle', 'auto'

---

#### Captain Already Exists Error

**Status Code:** `400 Bad Request`

**Response Body:**
```json
{
  "message": "Captain aready exist"
}
```

**Reasons:**
- Email is already registered to another captain
- Duplicate email attempt

---

## Captain Registration Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| `email` | Valid email format | "Invalid Email" |
| `fullname.firstname` | Minimum 3 characters | "Fisrt name must be at least 3 character long" |
| `password` | Minimum 6 characters | "Password must be at least 6 character long" |
| `vehicle.color` | Minimum 3 characters | "Color must be at least 3 characters long" |
| `vehicle.plate` | Minimum 3 characters | "Plate must be at least 3 characters long" |
| `vehicle.capacity` | Integer minimum 1 | "Capacity must be at least 1" |
| `vehicle.vehicleType` | One of: car, motorcycle, auto | "Invalid type" |

---

## Captain Registration Response Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| `201` | Created | Captain registration successful, token and captain data returned |
| `400` | Bad Request | Validation error in request body or duplicate email |

---

## Captain Model Technical Details

### Password Security
- Passwords are hashed using **bcrypt** with a salt round of 10
- Original password is never stored in the database
- Hashing is performed before captain creation

### Authentication
- JWT (JSON Web Token) is generated upon successful captain registration
- Token includes captain ID (`_id`) and is signed with `JWT_SECRET` environment variable
- Token expires in **24 hours** (unlike user tokens which don't have expiration)
- Token can be used for subsequent authenticated requests in Authorization header

### Captain Status & Availability
- New captains are created with `status: "inactive"` (offline)
- Status can be toggled to "active" when captain comes online
- Status is used to track captain availability for ride assignments

### Vehicle Information
- Vehicle details are stored as a nested object within the captain document
- Supported vehicle types: 'car', 'motorcycle', 'auto'
- Capacity determines how many passengers can be accommodated
- Plate number can be used as a unique vehicle identifier

### Location Tracking
- Captain location is stored with latitude and longitude coordinates
- Initially null when captain is registered
- Updated in real-time when captain is active/online

### Database
- Uses **MongoDB** with Mongoose ODM
- Captain email is stored as unique index (prevents duplicate emails)
- Captain schema includes optional `socketId` field for real-time socket connections

---

## Captain Registration Code Flow

1. Express validator middleware validates request body against all captain and vehicle rules
2. If validation fails, return `400` status with error details
3. If validation passes, controller receives request
4. Query database to check if captain with email already exists
5. If captain exists, return `400` status with duplicate error
6. If captain doesn't exist, hash the password using `bcrypt`
7. Captain service creates new captain document in MongoDB with vehicle details
8. JWT token is generated from captain ID (24-hour expiration)
9. Return `201` status with token and captain object

---

## Captain Registration Example Usage

### cURL
```bash
curl -X POST http://localhost:3000/captains/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "captain.john@example.com",
    "fullname": {
      "firstname": "John",
      "lastname": "Smith"
    },
    "password": "securePassword123",
    "vehicle": {
      "color": "Black",
      "plate": "DL-01-AB-1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }'
```

### JavaScript (Fetch API)
```javascript
fetch('http://localhost:3000/captains/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'captain.john@example.com',
    fullname: {
      firstname: 'John',
      lastname: 'Smith'
    },
    password: 'securePassword123',
    vehicle: {
      color: 'Black',
      plate: 'DL-01-AB-1234',
      capacity: 4,
      vehicleType: 'car'
    }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

---

## Notes

### General Notes
- Email addresses must be unique; registering with an existing email will result in a database error
- Last name is optional during registration but if provided must be at least 3 characters
- Passwords are case-sensitive
- Both registration and login endpoints exclude the password field from the response for security reasons (except during password verification)

### Captain-Specific Notes
- Vehicle details are mandatory for captain registration (unlike users who don't have vehicle info)
- Captain tokens expire in 24 hours, requiring re-registration or login for new token
- Only three vehicle types are supported: 'car', 'motorcycle', and 'auto'
- Capacity must be a positive integer representing maximum passenger count
- New captains start with "inactive" status and must explicitly go online

### Authentication & Authorization
- The returned JWT token should be stored on the client side (localStorage, sessionStorage, or cookies)
- The token must be included in the `Authorization` header as `Bearer <token>` for authenticated endpoints
- If token is missing, invalid, or expired, authenticated endpoints return `401 Unauthorized`
- Tokens are signed with `JWT_SECRET` environment variable and include the captain's ID
- Captain tokens have a 24-hour expiration (shorter than user sessions for security)

### Registration Security
- Duplicate email check prevents multiple captain accounts with same email
- Password hashing is performed with bcrypt before storage
- Generic error message should be considered to prevent email enumeration attacks

---

## POST `/captains/login`

### Request Method
```
POST
```

### Endpoint Path
```
/captains/login
```

### Description
Authenticates an existing captain by verifying email and password credentials. Returns a JWT authentication token upon successful login and sets token in cookie.

---

## Request Body

### Content-Type
```
application/json
```

```json
{
  // Valid email format - must be registered captain's email
  "email": "captain.john@example.com",
  
  // Password must be minimum 6 characters - case-sensitive
  "password": "securePassword123"
}
```

---

## Response

### Success Response

**Status Code:** `200 OK`

```json
{
  // JWT token valid for 24 hours - also set as HTTP cookie
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTIiLCJpYXQiOjE2MjM2NTAwMDAsImV4cCI6MTYyMzY1MDAwMH0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  
  "captain": {
    // MongoDB ObjectId - unique identifier for captain
    "_id": "507f1f77bcf86cd799439012",
    
    "fullname": {
      // First name - minimum 3 characters, required
      "firstname": "John",
      
      // Last name - minimum 3 characters, optional
      "lastname": "Smith"
    },
    
    // Unique email address - must be valid format
    "email": "captain.john@example.com",
    
    // Socket ID for real-time connections - null until captain goes online
    "socketId": null,
    
    // Captain availability status - either 'active' (online) or 'inactive' (offline)
    "status": "inactive",
    
    "vehicle": {
      // Vehicle color - minimum 3 characters, required
      "color": "Black",
      
      // Vehicle license plate - minimum 3 characters, required, unique
      "plate": "DL-01-AB-1234",
      
      // Number of passengers - minimum 1, required, must be integer
      "capacity": 4,
      
      // Vehicle type - must be one of: 'car', 'motorcycle', 'auto'
      "vehicleType": "car"
    },
    
    "location": {
      // Latitude coordinate - null until captain comes online, decimal format
      "lat": null,
      
      // Longitude coordinate - null until captain comes online, decimal format
      "lng": null
    }
  }
}
```

---

### Error Responses

#### Validation Error

**Status Code:** `400 Bad Request`

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

---

#### Authentication Error

**Status Code:** `401 Unauthorized`

```json
{
  // Generic error message used to prevent email enumeration attacks
  "message": "Invalid email or password"
}
```

**Reasons:**
- Email does not exist in database
- Password does not match the hashed password in database
- Captain account has been deleted

---

## Captain Login Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| `email` | Valid email format | "Invalid Email" |
| `password` | Minimum 6 characters | "Password must be at least 6 character long" |

---

## Captain Login Response Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| `200` | OK | Login successful, token and captain data returned |
| `400` | Bad Request | Validation error in request body |
| `401` | Unauthorized | Invalid email or password |

---

## Captain Login Code Flow

1. Express validator middleware validates email and password
2. If validation fails, return `400` status with error details
3. If validation passes, query database for captain by email (including password field)
4. If captain not found, return `401` Unauthorized with generic error message
5. Compare provided password with stored hashed password using bcrypt
6. If password doesn't match, return `401` Unauthorized with generic error message
7. If password matches, generate JWT token from captain ID (24-hour expiration)
8. Set token in HTTP cookie
9. Return `200` status with token and captain object (password excluded)

---

## Captain Login Example Usage

### cURL
```bash
curl -X POST http://localhost:3000/captains/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "captain.john@example.com",
    "password": "securePassword123"
  }'
```

### JavaScript (Fetch API)
```javascript
fetch('http://localhost:3000/captains/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include', // Important: include cookies
  body: JSON.stringify({
    email: 'captain.john@example.com',
    password: 'securePassword123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Token:', data.token);
  console.log('Captain:', data.captain);
  // Token is automatically set in cookies
})
.catch(error => console.error('Error:', error));
```

---

## GET `/captains/profile`

### Request Method
```
GET
```

### Endpoint Path
```
/captains/profile
```

### Description
Retrieves the authenticated captain's profile information. Requires valid JWT token in Authorization header or cookie. Uses authentication middleware to verify token.

---

## Request Headers

### Content-Type
```
application/json
```

```json
{
  // JWT token obtained from login endpoint - required
  // Format: "Bearer <token>"
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Alternative: Cookie Authentication

The token is automatically sent if stored in HTTP-only cookie from login endpoint.

---

## Response

### Success Response

**Status Code:** `200 OK`

```json
{
  "captain": {
    // MongoDB ObjectId - unique identifier
    "_id": "507f1f77bcf86cd799439012",
    
    "fullname": {
      // Captain's first name - minimum 3 characters
      "firstname": "John",
      
      // Captain's last name - minimum 3 characters, optional
      "lastname": "Smith"
    },
    
    // Captain's unique email address
    "email": "captain.john@example.com",
    
    // Socket ID for real-time connections - null when offline
    "socketId": null,
    
    // Current status - 'active' (online) or 'inactive' (offline)
    "status": "inactive",
    
    "vehicle": {
      // Vehicle color - minimum 3 characters
      "color": "Black",
      
      // Vehicle license plate - minimum 3 characters, unique
      "plate": "DL-01-AB-1234",
      
      // Passenger capacity - minimum 1, integer
      "capacity": 4,
      
      // Type of vehicle - 'car', 'motorcycle', or 'auto'
      "vehicleType": "car"
    },
    
    "location": {
      // Current latitude - null if offline, decimal format
      "lat": null,
      
      // Current longitude - null if offline, decimal format
      "lng": null
    }
  }
}
```

**Description:** Captain profile retrieved successfully. Returns authenticated captain's complete profile data including vehicle information and current status.

---

### Error Responses

#### Missing Authorization Header

**Status Code:** `401 Unauthorized`

```json
{
  "message": "Unauthorized"
}
```

**Reasons:**
- Authorization header is missing
- Token is not provided in Authorization header
- Cookie does not contain valid token

---

#### Invalid or Expired Token

**Status Code:** `401 Unauthorized`

```json
{
  "message": "Unauthorized"
}
```

**Reasons:**
- JWT token is invalid or malformed
- JWT token has expired (24-hour expiration)
- JWT token signature is tampered with
- Token has been blacklisted (after logout)

---

## Captain Profile Response Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| `200` | OK | Profile retrieved successfully |
| `401` | Unauthorized | Missing, invalid, or expired token |

---

## Captain Profile Code Flow

1. Authentication middleware (`authCaptain`) verifies JWT token from Authorization header or cookie
2. If token is missing or invalid, return `401` Unauthorized
3. If token is valid, extract captain ID from token
4. Middleware attaches captain data to `req.captain`
5. Controller retrieves captain from `req.captain` (already fetched by middleware)
6. Return `200` status with captain profile data (password excluded)

---

## Captain Profile Example Usage

### cURL with Authorization Header
```bash
curl -X GET http://localhost:3000/captains/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### cURL with Cookie
```bash
curl -X GET http://localhost:3000/captains/profile \
  -H "Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript (Fetch API) with Authorization Header
```javascript
const token = localStorage.getItem('captainToken'); // Token from login

fetch('http://localhost:3000/captains/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  console.log('Captain Profile:', data.captain);
})
.catch(error => console.error('Error:', error));
```

### JavaScript (Fetch API) with Cookies
```javascript
fetch('http://localhost:3000/captains/profile', {
  method: 'GET',
  credentials: 'include' // Send cookies with request
})
.then(response => response.json())
.then(data => {
  console.log('Captain Profile:', data.captain);
})
.catch(error => console.error('Error:', error));
```

---

## GET `/captains/logout`

### Request Method
```
GET
```

### Endpoint Path
```
/captains/logout
```

### Description
Logs out an authenticated captain by blacklisting the token and clearing cookies. Requires valid JWT token in Authorization header or cookie. After logout, the token becomes invalid for future requests.

---

## Request Headers

### Content-Type
```
application/json
```

```json
{
  // JWT token obtained from login endpoint - required
  // Format: "Bearer <token>"
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Alternative: Cookie Authentication

The token is automatically used if stored in HTTP-only cookie from login endpoint.

---

## Response

### Success Response

**Status Code:** `200 OK`

```json
{
  // Confirmation message that logout was successful
  "message": "Logout successfully"
}
```

**Description:** Captain successfully logged out. Session is cleared, token is blacklisted, and cookie is cleared. Any future requests using the blacklisted token will be rejected.

---

### Error Responses

#### Missing Authorization Header

**Status Code:** `401 Unauthorized`

```json
{
  "message": "Unauthorized"
}
```

**Reasons:**
- Authorization header is missing
- Token is not provided in Authorization header
- Cookie does not contain valid token

---

#### Invalid or Expired Token

**Status Code:** `401 Unauthorized`

```json
{
  "message": "Unauthorized"
}
```

**Reasons:**
- JWT token is invalid or malformed
- JWT token has expired (24-hour expiration)
- JWT token signature is tampered with

---

## Captain Logout Response Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| `200` | OK | Logout successful, token blacklisted |
| `401` | Unauthorized | Missing, invalid, or expired token |

---

## Captain Logout Technical Details

### Token Blacklisting
- Token is added to `blacklistTokenModel` when logout occurs
- Token remains in blacklist permanently
- Middleware checks against blacklist on subsequent requests
- Blacklisted tokens are rejected even if not expired

### Cookie Clearing
- HTTP cookie named 'token' is cleared on logout
- Cookie is cleared from both client and server
- Subsequent requests without Authorization header will fail

### Session Management
- Logout invalidates all active sessions for the captain
- Captain cannot use the old token after logout
- Captain must login again to get new token

---

## Captain Logout Code Flow

1. Authentication middleware (`authCaptain`) verifies JWT token from Authorization header or cookie
2. If token is missing or invalid, return `401` Unauthorized
3. If token is valid, extract token from header or cookie
4. Add token to blacklist model in database
5. Clear 'token' cookie from response
6. Return `200` status with success message

---

## Captain Logout Example Usage

### cURL with Authorization Header
```bash
curl -X GET http://localhost:3000/captains/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### cURL with Cookie
```bash
curl -X GET http://localhost:3000/captains/logout \
  -H "Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript (Fetch API) with Authorization Header
```javascript
const token = localStorage.getItem('captainToken'); // Token from login

fetch('http://localhost:3000/captains/logout', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // { message: "Logout successfully" }
  localStorage.removeItem('captainToken'); // Remove token from storage
})
.catch(error => console.error('Error:', error));
```

### JavaScript (Fetch API) with Cookies
```javascript
fetch('http://localhost:3000/captains/logout', {
  method: 'GET',
  credentials: 'include' // Send cookies with request
})
.then(response => response.json())
.then(data => {
  console.log(data); // { message: "Logout successfully" }
  // Cookie is automatically cleared by server
  // Any stored token in localStorage should also be removed
  localStorage.removeItem('captainToken');
})
.catch(error => console.error('Error:', error));
```

---

## Captain Routes Summary

| Route | Method | Authentication | Purpose |
|-------|--------|----------------|---------|
| `/captains/register` | POST | No | Register new captain account with vehicle details |
| `/captains/login` | POST | No | Authenticate captain and receive token |
| `/captains/profile` | GET | Yes (Required) | Retrieve authenticated captain's profile |
| `/captains/logout` | GET | Yes (Required) | Logout captain and blacklist token |

---

## Captain Authentication Security Notes

### Token Security
- JWT tokens expire in 24 hours - requires re-login for new token
- Tokens are signed with `JWT_SECRET` environment variable
- Token tampering is detected and rejected by authentication middleware
- Tokens are blacklisted on logout - old tokens cannot be reused

### Password Security
- Passwords are hashed with bcrypt (salt round 10) before storage
- Original passwords are never stored or transmitted in responses
- Generic error message "Invalid email or password" prevents email enumeration
- Password comparison uses bcrypt's constant-time comparison for security

### Cookie vs Header Authentication
- Server sets token in HTTP cookie after login
- Token can be sent via Authorization header or cookie
- Middleware checks both cookie and header for token
- Cookies are cleared on logout

### Database Blacklist
- All logout tokens are stored in `blacklistTokenModel`
- Authentication middleware checks token against blacklist
- Blacklisted tokens are permanently invalid
- Useful for immediate logout without waiting for expiration

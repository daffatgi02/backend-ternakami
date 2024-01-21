# API Documentation TernaKami

## 1. Register <a name="register"></a>

### Endpoint
```http
POST /api/auth/register
```

### Request
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "fullname": "John Doe"
  }
  ```

### Response
- **Success (201):**
  ```json
  {
    "message": "Successful Account Registration. Please Log In",
    "statusCode": 201
  }
  ```
- **Error (400):**
  ```json
  {
    "message": "Email, Password, and Fullname fields must all be filled",
    "statusCode": 400
  }
  ```
  OR
  ```json
  {
    "message": "Email already taken",
    "statusCode": 400
  }
  ```
- **Error (500):**
  ```json
  {
    "message": "Internal Server Error",
    "statusCode": 500
  }
  ```

## 2. Login <a name="login"></a>

### Endpoint
```http
POST /api/auth/login
```

### Request
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Response
- **Success (200):**
  ```json
  {
    "loginResult": {
      "email": "user@example.com",
      "fullname": "John Doe",
      "token": "<JWT_TOKEN>",
      "userid": 1
    },
    "message": "Login Success"
  }
  ```
- **Error (400):**
  ```json
  {
    "message": "Wrong Password or Account not found"
  }
  ```
- **Error (500):**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

## 3. Predict <a name="predict"></a>

### Endpoint
```http
POST /api/predict
```

### Request
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: multipart/form-data`
- **Body:**
  - `image` (File): Image file to be processed.
  - `type` (String): Type of the animal.
  - `Animal_Name` (String): Name of the animal.

### Response
- **Success (200):**
  ```json
  {
    "class": "cat",
    "probability": 0.85
  }
  ```
- **Error (400):**
  ```json
  {
    "error": "No image, type, or Animal_Name specified"
  }
  ```
- **Error (401):**
  ```json
  {
    "message": "No token provided"
  }
  ```
- **Error (500):**
  ```json
  {
    "error": "Error saving history"
  }
  ```

## 4. History <a name="history"></a>

### Endpoint
```http
GET /api/history
```

### Request
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`

### Response
- **Success (200):**
  ```json
  [
    {
      "id": 1,
      "user_id": 1,
      "animal_type": "cat",
      "animal_name": "Whiskers",
      "prediction_class": "cat",
      "prediction_probability": 0.85,
      "formatted_created_at": "2024-01-21 12:34:56"
    },
  ]
  ```
- **Error (401):**
  ```json
  {
    "message": "Unauthorized"
  }
  ```
- **Error (500):**
  ```json
  {
    "error": "Error fetching history"
  }
  ```

## 5. Homepage <a name="homepage"></a>

### Endpoint
```http
GET /api/homepage
```

### Request
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`

### Response
- **Success (200):**
  ```json
  {
    "message": "Welcome, John Doe"
  }
  ```
- **Error (401):**
  ```json
  {
    "message": "Token Expired or Unauthorized. Please Login/Register"
  }
  ```
- **Error (500):**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

## Server Information

The server is running on `http://localhost:3000`.

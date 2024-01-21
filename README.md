
#### API Endpoints TernaKami

##### 1. Register User

- **Endpoint:** `/api/auth/register`
- **Method:** `POST`
- **Request:**
  - JSON Body:
    - `email` (string): User's email
    - `password` (string): User's password
    - `fullname` (string): User's full name
- **Response:**
  - Success (201):
    ```json
    {
      "message": "Successful Account Registration. Please Log In",
      "statusCode": 201
    }
    ```
  - Error (400/500):
    ```json
    {
      "message": "Error message",
      "statusCode": 400/500
    }
    ```

##### 2. Login User

- **Endpoint:** `/api/auth/login`
- **Method:** `POST`
- **Request:**
  - JSON Body:
    - `email` (string): User's email
    - `password` (string): User's password
- **Response:**
  - Success (200):
    ```json
    {
      "loginResult": {
        "email": "user@example.com",
        "fullname": "John Doe",
        "token": "[JWT-token]",
        "userid": 1
      },
      "message": "Login Success"
    }
    ```
  - Error (400/500):
    ```json
    {
      "message": "Error message",
      "statusCode": 400/500
    }
    ```

##### 3. Validate Token

- **Endpoint:** `/api/validation`
- **Method:** `GET`
- **Request:**
  - Headers:
    - `Authorization`: Bearer [JWT-token]
- **Response:**
  - Success (200):
    ```json
    {
      "message": "Token is still valid",
      "decodedUser": {
        "id": 1,
        "fullname": "John Doe"
      }
    }
    ```
  - Error (401/500):
    ```json
    {
      "message": "Error message",
      "statusCode": 401/500
    }
    ```

##### 4. Predict Animal

- **Endpoint:** `/api/predict`
- **Method:** `POST`
- **Request:**
  - Headers:
    - `Authorization`: Bearer [JWT-token]
  - Form Data:
    - `image` (file): Image file to predict
    - `type` (string): Animal type
    - `Animal_Name` (string): Animal name
- **Response:**
  - Success (200):
    ```json
    {
      "class": "Dog",
      "probability": 0.85
    }
    ```
  - Error (400/500):
    ```json
    {
      "error": "Error message",
      "statusCode": 400/500
    }
    ```

##### 5. View History

- **Endpoint:** `/api/history`
- **Method:** `GET`
- **Request:**
  - Headers:
    - `Authorization`: Bearer [JWT-token]
- **Response:**
  - Success (200):
    ```json
    [
      {
        "id": 1,
        "user_id": 1,
        "animal_type": "Dog",
        "animal_name": "Buddy",
        "prediction_class": "Dog",
        "prediction_probability": 0.85,
        "formatted_created_at": "2024-01-21 12:30:45"
      },
      // Additional history entries...
    ]
    ```
  - Error (500):
    ```json
    {
      "error": "Error message"
    }
    ```

##### 6. Homepage

- **Endpoint:** `/api/homepage`
- **Method:** `GET`
- **Request:**
  - Headers:
    - `Authorization`: Bearer [JWT-token]
- **Response:**
  - Success (200):
    ```json
    {
      "message": "Welcome, John Doe"
    }
    ```
  - Error (401/500):
    ```json
    {
      "message": "Error message",
      "statusCode": 401/500
    }
    ```

#### Dependencies

- `express`: Web application framework
- `mysql`: MySQL database driver
- `body-parser`: Parse incoming request bodies
- `jsonwebtoken`: Create and verify JSON Web Tokens (JWT)
- `bcryptjs`: Hash passwords
- `axios`: HTTP client for making requests
- `cors`: Enable CORS for the server
- `express-fileupload`: Handle file uploads
- `moment-timezone`: Parse, validate, manipulate, and display dates

#### Author

[daffatgi02]


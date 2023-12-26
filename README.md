# Dokumentasi API TernaKami

### 1. Backend Node.js

#### a. Register Endpoint

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  - `email`: string
  - `password`: string
  - `fullname`: string
- **Response**:
  - **Success**:
    - **Status**: 200
    - **Content**: 
      ```json
      {
        "error": false,
        "message": "Berhasil Register Akun. Silahkan Login"
      }
      ```
  - **Error**:
    - **Status**: 400
    - **Content**:
      ```json
      {
        "error": true,
        "message": "Email already taken"
      }
      ```

#### b. Login Endpoint
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  - `email`: string
  - `password`: string
- **Response**:
  - **Success**:
    - **Status**: 200
    - **Content**:
      ```json
      {
        "error": false,
        "loginResult": {
          "email": "<user_email>",
          "fullname": "<user_fullname>",
          "token": "<auth_token>",
          "userid": "<user_id>"
        },
        "message": "Login Success"
      }
      ```
  - **Error**:
    - **Status**: 400
    - **Content**:
      ```json
      {
        "error": true,
        "message": "Wrong Password or Account not found"
      }
      ```

#### c. Predict Endpoint
- **URL**: `/api/predict`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**:
  - `image`: file
  - `type`: string
  - `animalName`: string
- **Response**:
  - **Success**:
    - **Status**: 200
    - **Content**: *Response from Flask API*
  - **Error**:
    - **Status**: 400/401/500
    - **Content**: *Dependent on error type*

#### d. History Endpoint
- **URL**: `/api/history`
- **Method**: `GET`
- **Response**:
  - **Success**:
    - **Status**: 200
    - **Content**: *Array of history records*
  - **Error**:
    - **Status**: 500
    - **Content**:
      ```json
      {
        "error": true,
        "message": "Error fetching history"
      }
      ```

#### e. Homepage Endpoint
- **URL**: `/api/homepage`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  - **Success**:
    - **Status**: 200
    - **Content**: 
      ```json
      {
        "message": "Welcome, <user_fullname>"
      }
      ```
  - **Error**:
    - **Status**: 401
    - **Content**:
      ```json
      {
        "error": true,
        "message": "Unauthorized"
      }
      ```

### 2. Backend Python Flask (Aplikasi Serving Model Machine Learning)

#### a. Predict Endpoint
- **URL**: `/predict`
- **Method**: `POST`
- **Form Data**:
  - `image`: file
  - `type`: string (e.g., "sapi", "kambing")
- **Response**:
  - **Success**:
    - **Status**: 200
    - **Content**:
      ```json
      {
        "class": "<predicted_class>",
        "probability": <probability_value>
      }
      ```
  - **Error**:
    - **Status**: 400/500
    - **Content**: *Dependent on error type*

#### b. Index Endpoint
- **URL**: `/`
- **Method**: `GET`
- **Response**:
  - **Content**: `'SERVICE API AKTIF'`

### Catatan
- Output JSON untuk setiap endpoint diberikan dalam format contoh. Nilai sebenarnya tergantung pada eksekusi API.
- Pastikan untuk mengatur environment variables untuk koneksi database di backend Node.js.
- Untuk Flask API, model dipilih berdasarkan `type` yang dikirimkan.

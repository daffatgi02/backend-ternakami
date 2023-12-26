# Dokumentasi API TernaKami
## A. Dokumentasi API Backend Node.js

#### 1. Registrasi Pengguna (User Registration)

- **Endpoint**: `/api/auth/register`
- **Method**: POST
- **Body**:
  - `email`: String (Email pengguna)
  - `password`: String (Password pengguna)
  - `fullname`: String (Nama lengkap pengguna)
- **Response**: 
  - **Success** (200 OK):
    ```json
    {
      "error": false,
      "message": "Berhasil Register Akun. Silahkan Login"
    }
    ```
  - **Failure** (400 Bad Request):
    ```json
    {
      "error": true,
      "message": "Email already taken"
    }
    ```

#### 2. Login Pengguna (User Login)

- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Body**:
  - `email`: String
  - `password`: String
- **Response**: 
  - **Success** (200 OK):
    ```json
    {
      "error": false,
      "loginResult": {
        "email": "user@example.com",
        "fullname": "Nama Pengguna",
        "token": "<jwt_token>",
        "userid": 1
      },
      "message": "Login Success"
    }
    ```
  - **Failure** (400 Bad Request):
    ```json
    {
      "error": true,
      "message": "Wrong Password or Account not found"
    }
    ```

#### 3. Prediksi Menggunakan Backend FLASK API 

- **Endpoint**: `/api/predict`
- **Method**: POST
- **Headers**:
  - `Authorization`: `Bearer <jwt_token>`
- **Body**: 
  - `image`: File (Gambar hewan)
  - `type`: String (Tipe hewan, misal: "sapi", "kambing")
  - `animalName`: String (Nama hewan)
- **Response**: 
  - **Success** (200 OK): (Contoh response dari server Python Flask)
    ```json
    {
      "class": "Mata Sapi Sehat!",
      "probability": 0.95
    }
    ```
  - **Failure** (400 Bad Request / 401 Unauthorized / 500 Internal Server Error):
    ```json
    {
      "error": true,
      "message": "<error_message>"
    }
    ```

#### 4. Riwayat Prediksi (History)

- **Endpoint**: `/api/history`
- **Method**: GET
- **Response**: 
  - **Success** (200 OK):
    ```json
    [
      {
        "number": 1,
        "animalName": "jeki",
        "animalType": "kambing",
        "classificationResult": "Mata Kambing Terjangkit Penyakit Pinkeye",
        "date": "2023-12-26"
      },
    ]
    ```
  - **Failure** (500 Internal Server Error):
    ```json
    {
      "error": true,
      "message": "Error fetching history"
    }
    ```

#### 5. Homepage

- **Endpoint**: `/api/homepage`
- **Method**: GET
- **Headers**:
  - `Authorization`: `Bearer <jwt_token>`
- **Response**: 
  - **Success** (200 OK):
    ```json
    {
      "message": "Welcome, Nama Pengguna"
    }
    ```

### Struktur Database SQL

#### Tabel `users`
- `id`: INT PRIMARY KEY
- `email`: VARCHAR(255)
- `password`: VARCHAR(255)
- `fullname`: VARCHAR(255)

#### Tabel `animal_history`
- `id`: INT PRIMARY KEY
- `userId`: INT
- `animalName`: VARCHAR(255)
- `created_at`: TIMESTAMP
- `animalType`: VARCHAR(255)
- `classificationResult`: VARCHAR(255)

Catatan:
- Pastikan telah mengatur variabel lingkungan untuk database (DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE).
- Pastikan token JWT (`yourkey-123`) dan rute server Flask (`http://127.0.0.1:8080/predict`) sesuai dengan konfigurasi.
- Handle error secara tepat pada setiap endpoint untuk memastikan stabilitas dan keamanan API.



## B. Backend Python Flask (Aplikasi Serving Model Machine Learning)

#### 1. Predict Endpoint
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

#### 2. Index Endpoint
- **URL**: `/`
- **Method**: `GET`
- **Response**:
  - **Content**: `'SERVICE API AKTIF'`

### Catatan
- Output JSON untuk setiap endpoint diberikan dalam format contoh. Nilai sebenarnya tergantung pada eksekusi API.
- Pastikan untuk mengatur environment variables untuk koneksi database di backend Node.js.
- Untuk Flask API, model dipilih berdasarkan `type` yang dikirimkan.

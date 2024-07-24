Berdasarkan kode yang diberikan, berikut adalah dokumentasi API yang dapat digunakan oleh frontend:

1. **Registrasi Pengguna**
   - Endpoint: `/api/auth/register`
   - Metode: `POST`
   - Body:
     - `email` (string, wajib)
     - `password` (string, wajib)
     - `fullname` (string, wajib)
   - Respons Sukses:
     - Status: 201 Created
     - Body: `{ message: "Successful Account Registration. Please Log In", statusCode: 201 }`
   - Respons Gagal:
     - Status: 400 Bad Request
     - Body: `{ message: "Email, Password, and Fullname fields must all be filled", statusCode: 400 }` atau `{ message: "Email already taken", statusCode: 400 }`
     - Status: 500 Internal Server Error
     - Body: `{ message: "Internal Server Error during registration", statusCode: 500 }`

2. **Login Pengguna**
   - Endpoint: `/api/auth/login`
   - Metode: `POST`
   - Body:
     - `email` (string, wajib)
     - `password` (string, wajib)
   - Respons Sukses:
     - Status: 200 OK
     - Body: `{ loginResult: { email, fullname, token, userid }, message: "Login Success" }`
   - Respons Gagal:
     - Status: 400 Bad Request
     - Body: `{ message: "Wrong Password or Account not found" }`

3. **Validasi Token**
   - Endpoint: `/api/validation`
   - Metode: `GET`
   - Headers:
     - `Authorization: Bearer <token>`
   - Respons Sukses:
     - Status: 200 OK
     - Body: `{ message: "Token is still valid", decodedUser: { id, fullname } }`
   - Respons Gagal:
     - Status: 401 Unauthorized
     - Body: `{ message: "No token provided" }` atau `{ message: "Token Expired. Please Login!" }` atau `{ message: "Invalid token. Please provide a valid token." }` atau `{ message: "Failed to authenticate token" }`

4. **Prediksi Mata Hewan**
   - Endpoint: `/api/predict`
   - Metode: `POST`
   - Headers:
     - `Authorization: Bearer <token>`
   - Body:
     - `image` (file, wajib)
     - `type` (string, wajib)
     - `Animal_Name` (string, wajib)
   - Respons Sukses:
     - Status: 200 OK
     - Body: `{ label_prediksi, confidence }`
   - Respons Gagal:
     - Status: 400 Bad Request
     - Body: `{ error: "No image, type, or Animal_Name specified" }`
     - Status: 401 Unauthorized
     - Body: `{ message: "No token provided" }` atau `{ message: "Failed to authenticate token" }`
     - Status: 500 Internal Server Error
     - Body: `{ error: "Error uploading image" }` atau `{ error: "Error saving prediction" }` atau `{ error: "Error during prediction" }`

  5. **Riwayat Prediksi**
    - Endpoint: `/api/historyPredict`
    - Metode: `GET`
    - Headers:
      - `Authorization: Bearer <token>`
    - Respons Sukses:
      - Status: 200 OK
      - Body: Array of `{ id, user_id, animal_type, animal_name, prediction_class, prediction_probability, image_url, formatted_created_at }`
    - Respons Gagal:
      - Status: 401 Unauthorized
      - Body: `{ message: "No token provided" }` atau `{ message: "Failed to authenticate token" }`
      - Status: 404 Not Found
      - Body: `{ message: "No prediction history found for this user." }`
      - Status: 500 Internal Server Error
      - Body: `{ error: "Error fetching history" }`

6. **Homepage**
   - Endpoint: `/api/homepage`
   - Metode: `GET`
   - Headers:
     - `Authorization: Bearer <token>`
   - Respons Sukses:
     - Status: 200 OK
     - Body: `{ message: "Welcome, <fullname>" }`
   - Respons Gagal:
     - Status: 401 Unauthorized
     - Body: `{ message: "No token provided" }` atau `{ message: "Failed to authenticate token" }`

Catatan:
- Semua endpoint yang memerlukan token harus menyertakan header `Authorization: Bearer <token>`.
- Respons gagal dapat memiliki status dan pesan yang berbeda-beda tergantung jenis kesalahannya.
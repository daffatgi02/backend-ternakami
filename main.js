const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const FormData = require('form-data');
require('dotenv').config()

const app = express();
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST, // Use the environment variable
    user: process.env.DB_USER, // Use the environment variable
    password: process.env.DB_PASSWORD, // Use the environment variable
    database: process.env.DB_DATABASE, // Use the environment variable
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Register Endpoint
// Function to get user by email
const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT email FROM users WHERE email = ?', [email], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length > 0 ? result[0] : null);
            }
        });
    });
};

// Function to send success response
const sendSuccessResponse = (res, statusCode, message) => {
    res.status(statusCode).json({
        error: false,
        message: message,
        statusCode: statusCode
    });
};

// Function to send error response
const sendErrorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({
        error: true,
        message: message,
        statusCode: statusCode
    });
};

// Function to insert user into database
const insertUser = (email, hashedPassword, fullname) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO users (email, password, fullname) VALUES (?, ?, ?)', [email, hashedPassword, fullname], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Function to register a user
const registerUser = async (req, res) => {
    const { email, password, fullname } = req.body;

    // Validasi input
    if (!email || !password || !fullname) {
        return sendErrorResponse(res, 400, 'Email, Password, and Fullname fields must all be filled');
    }

    try {
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return sendErrorResponse(res, 400, 'Email already taken');
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        await insertUser(email, hashedPassword, fullname);

        sendSuccessResponse(res, 201, 'Berhasil Register Akun. Silahkan Login');
    } catch (error) {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

app.post('/api/auth/register', registerUser);



// Login Endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) throw err;

        if (result.length === 0 || !(await bcrypt.compare(password, result[0].password))) {
            return res.status(400).json({ error: true, message: 'Wrong Password or Account not found' });
        }

        const token = jwt.sign(
            { id: result[0].id, fullname: result[0].fullname }, // Menambahkan fullname
            'daffa123', 
            { expiresIn: '24h' }
        );
        res.status(200).json({
            error: false,
            loginResult: {
                email: result[0].email,
                fullname: result[0].fullname,
                token: token,
                userid: result[0].id
            },
            message: 'Login Success'
        });
    });
});

// Endpoint untuk machine learning backend apps yang sudah di deploy// Utility function untuk memvalidasi file gambar
const validateImageFile = (imageFile) => {
    const minSizeBytes = 200 * 1024; // 200KB
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const validMimeTypes = ['image/jpeg', 'image/jpg'];

    if (!validMimeTypes.includes(imageFile.mimetype)) {
        throw new Error("Only jpg and jpeg file types are allowed");
    }

    if (imageFile.size < minSizeBytes || imageFile.size > maxSizeBytes) {
        throw new Error("Image size must be between 200KB and 5MB");
    }
};

// Handler function untuk /api/predict endpoint
const handlePredictEndpoint = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: true, message: 'No token provided' });
        }

        const decoded = await jwt.verify(token, 'daffa123');
        if (!req.files || !req.files.image || !req.body.type) {
            return res.status(400).json({ "error": "No image or type specified" });
        }

        const imageFile = req.files.image;
        validateImageFile(imageFile); // Memvalidasi file gambar

        const formData = new FormData();
        formData.append('image', imageFile.data, imageFile.name);
        formData.append('type', req.body.type);

        const response = await axios.post('http://127.0.0.1:8080/predict', formData, { headers: formData.getHeaders() });
        const classificationResult = response.data.class; // Hasil klasifikasi

        // Simpan hasil ke database
        db.query('INSERT INTO animal_history (userId, animalName, animalType, classificationResult) VALUES (?, ?, ?, ?)',
            [decoded.id, req.body.animalName, req.body.type, classificationResult], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: true, message: 'Error saving to history' });
                }
                res.json(response.data); // Kirim response ke user
            });
    } catch (err) {
        const { status, message } = handleFlaskAPIError(err);
        res.status(status).json({ "error": message });
    }
};

// Endpoint untuk machine learning backend apps yang sudah di deploy
app.post('/api/predict', handlePredictEndpoint);

//endpoint history
app.get('/api/history', (req, res) => {
    db.query('SELECT * FROM animal_history ORDER BY created_at DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ error: true, message: 'Error fetching history' });
        }

        // Format hasil query dan kirim sebagai response
        const formattedResults = results.map((item, index) => {
            // Format tanggal
            const date = new Date(item.created_at);
            const formattedDate = date.toISOString().split('T')[0]; // Menghasilkan format 'YYYY-MM-DD'

            return {
                number: index + 1,
                animalName: item.animalName,
                animalType: item.animalType,
                classificationResult: item.classificationResult,
                date: formattedDate 
            };
        });
        res.json(formattedResults);
    });
});


// Homepage Endpoint
app.get('/api/homepage', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Ambil token dari header
    jwt.verify(token, 'daffa123', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: true, message: 'Unauthorized' });
        }
        res.json({ message: `Welcome, ${decoded.fullname}` }); // Tampilkan fullname
    });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const fileUpload = require('express-fileupload');
const FormData = require('form-data');
require('dotenv').config()

const app = express();
app.use(bodyParser.json());
app.use(fileUpload());

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
app.post('/api/auth/register', (req, res) => {
    const { email, password, fullname } = req.body;
    db.query('SELECT email FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            return res.status(400).json({ error: true, message: 'Email already taken' });
        } else {
            const hashedPassword = await bcrypt.hash(password, 8);
            db.query('INSERT INTO users (email, password, fullname) VALUES (?, ?, ?)', [email, hashedPassword, fullname], (err, result) => {
                if (err) throw err;
                res.status(200).json({ error: false, message: 'Berhasil Register Akun. Silahkan Login' });
            });
        }
    });
});

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


// Endpoint untuk machine learning backend apps yang sudah di deploy
const handleFlaskAPIError = (error) => {
    if (error.response) {
        return { status: 500, message: error.message };
    } else if (error.request) {
        return { status: 503, message: "Service API sedang diperbaiki, coba sesaat lagi" };
    } else {
        return { status: 500, message: "Error: " + error.message };
    }
};

app.post('/api/predict', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: true, message: 'No token provided' });
    }

    jwt.verify(token, 'daffa123', async (err, decoded) => {
        if (err) {
            return res.status(500).json({ error: true, message: 'Failed to authenticate token' });
        }

        if (!req.files || !req.files.image || !req.body.type) {
            return res.status(400).json({ "error": "No image or type specified" });
        }

        const animalName = req.body.animalName;
        const animalType = req.body.type; // Tipe hewan
        const userId = decoded.id;

        const formData = new FormData();
        formData.append('image', req.files.image.data, req.files.image.name);
        formData.append('type', animalType);

        axios.post('http://127.0.0.1:8080/predict', formData, { headers: formData.getHeaders() })
            .then(response => {
                const classificationResult = response.data.class; // Hasil klasifikasi

                // Simpan nama hewan, tipe hewan, dan hasil klasifikasi ke database
                db.query('INSERT INTO animal_history (userId, animalName, animalType, classificationResult) VALUES (?, ?, ?, ?)', 
                         [userId, animalName, animalType, classificationResult], (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: true, message: 'Error saving to history' });
                    }
                    res.json(response.data); // Kirim response ke user
                });
            })
            .catch(error => {
                const { status, message } = handleFlaskAPIError(error);
                res.status(status).json({ "error": message });
            });
    });
});


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
                date: formattedDate // Gunakan tanggal yang sudah diformat
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

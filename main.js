const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const FormData = require('form-data');
const moment = require('moment-timezone');

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

// FUCNTION REGISTER =============

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
//====================================================


//===============================ENDPOINT=============================================
app.post('/api/auth/register', async (req, res) => {
    const { email, password, fullname } = req.body;

    // Validasi input
    if (!email || !password || !fullname) {
        return res.status(400).json({
            message: 'Email, Password, and Fullname fields must all be filled',
            statusCode: 400
        });
    }

    try {
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                message: 'Email already taken',
                statusCode: 400
            });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        await insertUser(email, hashedPassword, fullname);

        res.status(201).json({
            message: 'Successful Account Registration. Please Log In',
            statusCode: 201
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            statusCode: 500
        });
    }
});

// Function to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, 'daffa123', (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token Expired Please Login!' });
            } else {
                return res.status(500).json({ message: 'Failed to authenticate token' });
            }
        }

        req.decoded = decoded; // Attach the decoded user information to the request object
        next(); // Move on to the next middleware or route handler
    });
};

// Endpoint for testing token expiration
app.get('/api/validation', verifyToken, (req, res) => {
    res.json({ message: 'Token is still valid', decodedUser: req.decoded });
});
// Login Endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) throw err;

        if (result.length === 0 || !(await bcrypt.compare(password, result[0].password))) {
            return res.status(400).json({   message: 'Wrong Password or Account not found' });
        }

        const token = jwt.sign(
            { id: result[0].id, fullname: result[0].fullname }, // Menambahkan fullname
            'daffa123', 
            { expiresIn: '7d' }
        );
        res.status(200).json({
             
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

//========================================================================================
// Endpoint untuk melakukan prediksi
app.post('/api/predict', verifyToken, (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({   message: 'No token provided' });
    }

    jwt.verify(token, 'daffa123', async (err, decoded) => {
        if (err) {
            return res.status(500).json({   message: 'Failed to authenticate token' });
        }

        if (!req.files || !req.files.image || !req.body.type || !req.body.Animal_Name) {
            return res.status(400).json({ "error": "No image, type, or Animal_Name specified" });
        }

        const animalType = req.body.type; // Tipe hewan
        const animalName = req.body.Animal_Name; // Nama hewan
        const formData = new FormData();
        formData.append('image', req.files.image.data, req.files.image.name);
        formData.append('type', animalType);
        formData.append('Animal_Name', animalName);

        // Simpan data history
        const created_at = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

        // Lakukan prediksi
        axios.post('http://127.0.0.1:8080/predict', formData, { headers: formData.getHeaders() })
            .then(async response => {
                const predictionResult = response.data;
                const { class: predictionClass, probability } = predictionResult;

                // Simpan data history
                db.query(
                    'INSERT INTO history (user_id, animal_type, animal_name, created_at, prediction_class, prediction_probability) VALUES (?, ?, ?, ?, ?, ?)',
                    [decoded.id, animalType, animalName, created_at, predictionClass, probability],
                    (error, result) => {
                        if (error) {
                            return res.status(500).json({ "error": "Error saving history" });
                        }

                        res.json(predictionResult); // Kirim response ke user
                    }
                );
            })
            .catch(error => {
                let status = 500;
                let message = "Error: " + error.message;

                if (error.response) {
                    status = 500;
                    message = error.message;
                } else if (error.request) {
                    status = 503;
                    message = "Service API is currently under maintenance, please try again shortly.";
                }

                res.status(status).json({ "error": message });
            });
    });
});
// Endpoint untuk melihat data history
app.get('/api/history', verifyToken, (req, res) => {
    // Use decoded user information from the verifyToken middleware
    const userId = req.decoded.id;

    // Ambil data history berdasarkan user_id
    db.query('SELECT * FROM history WHERE user_id = ?', [userId], (error, result) => {
        if (error) {
            return res.status(500).json({ "error": "Error fetching history" });
        }

        // Mengubah format waktu pada setiap data history
        const formattedResult = result.map(item => {
            const formattedCreatedAt = moment(item.created_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
            return {
                id: item.id,
                user_id: item.user_id,
                animal_type: item.animal_type,
                animal_name: item.animal_name,
                prediction_class: item.prediction_class,
                prediction_probability: item.prediction_probability,
                formatted_created_at: formattedCreatedAt
            };
        });

        res.json(formattedResult); // Kirim data history dengan format waktu ke user
    });
});




// Homepage Endpoint
app.get('/api/homepage',verifyToken, (req, res) => {
    res.json({ message: `Welcome, ${req.decoded.fullname}` });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

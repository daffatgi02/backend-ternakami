const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const fileUpload = require('express-fileupload');
const FormData = require('form-data');

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

        const token = jwt.sign({ id: result[0].id }, 'daffa123', { expiresIn: '24h' });
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
app.post('/api/predict', async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        // Create a FormData object to send the image
        const formData = new FormData();
        formData.append('image', req.files.image.data, {
            filename: req.files.image.name,
            contentType: req.files.image.mimetype,
        });

        // Make a POST request to the prediction API
        const response = await axios.post('http://{url-deployment-machinelearning}/predict', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // Return the response from the prediction API to the client
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi Kesalahan di server" });
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

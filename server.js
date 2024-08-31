const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up storage engine for file uploads
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname)); // Generate unique filename
    }
});

// Initialize upload
const upload = multer({ storage: storage }).single('file');

// Handle file upload
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json({ message: 'File upload failed', error: err });
        }
        const fileLink = `${req.protocol}://${req.get('host')}/download/${req.file.filename}`;
        res.status(200).json({ message: 'File uploaded successfully', link: fileLink });
    });
});

// Handle file download
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

// Handle root URL
app.get('/', (req, res) => {
    res.send('Welcome to the file upload server!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
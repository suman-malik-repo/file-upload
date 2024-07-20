const express = require('express');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const ejs = require('ejs');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uploadDir = process.env.UPLOAD_DIR || 'public/uploads';

// Configure EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure multer for file upload handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to show the upload form
app.get('/', (req, res) => {
    res.render('index');
});

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.render('showFile', { fileUrl });
});

// Route to show the uploaded file
app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    res.sendFile(filePath);
});


// Route to list all image files as JSON
app.get('/images', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory.');
        }

        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.gif'].includes(ext);
        });

        const imageUrls = imageFiles.map(file => `/uploads/${file}`);
        res.json(imageUrls);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

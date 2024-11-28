const express = require('express');
const multer = require('multer');
const convertController = require('../controllers/convertercontroller');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Route to create a conversion job
router.post('/convert', upload.single('file'), convertController.convertToPDF);

// Route to check the job status
router.get('/status/:jobId', convertController.checkJobStatus);

// Route to download the converted PDF
router.get('/download/:jobId', convertController.downloadPDF);

module.exports = router;

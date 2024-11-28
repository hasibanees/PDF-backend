const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const docxToPdf = require('docx-pdf');
const multer = require('multer');
const path = require("path");
const mammoth = require('mammoth');
const fs = require('fs');
const cors = require('cors');
// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json());

app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
  
app.post('/convert', upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "please upload the file"
            })
        }
        const outputpath = path.join(__dirname, "files", `${req.file.originalname}.pdf`)
        docxToPdf(req.file.path, outputpath, (err, result) => {
            if (err) {
                console.log(err);
                return req.status(500).json({
                    message: "Error converting to pdf"
                })
            }
            res.download(outputpath, () => {
                console.log("file downloaded");
            })
        });
    } catch (error) {
        res.status(500).json({
            message: "internal server error"
        })
    }
})

app.post('/convert-Word', upload.single('file'), async (req, res) => {
    try {
      // Ensure the file exists
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
  
      // Extract the file path from req.file
      const filePath = req.file.path;
      console.log(filePath, "this is file path");
  
      // Convert the document to HTML
      const result = await mammoth.convertToHtml({ path: filePath });
  
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
  
      // Send back the HTML content
      res.send(result.value);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  });
// MongoDB connection (if needed)
mongoose.connect('mongodb+srv://astraldevelopers0:Izaan511@cluster1.hkl6s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err));

// Server listener
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

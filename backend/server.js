const express = require('express');
const multer = require('multer');
const videoIntelligence = require('./videoIntelligence');
const translate = require('./translate');

const app = express();
const upload = multer();

app.post('/upload', upload.single('video'), async (req, res) => {
  const videoFile = req.file; // Access the uploaded video file from req.file

  try {
    // Perform video analysis using videoIntelligence.js
    const videoLabels = await videoIntelligence.analyzeVideo(videoFile.buffer);

    // Perform translation using translate.js
    const translatedLabels = await translate.translateLabels(videoLabels);

    // Prepare the response data
    const response = {
      labels: translatedLabels,
    };

    // Send the response back to the frontend
    res.json(response);
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const videoAnalysis = require('./VideoAnalysis');
const { translateText } = require('./translate');

const app = express();
const upload = multer();

// Enable CORS for all routes
app.use(cors());

app.post('/upload', upload.single('video'), async (req, res) => {
  const videoFile = req.file; // Access the uploaded video file from req.file

  console.log(videoFile);
  try {
    // Perform video analysis using videoIntelligence.js
    const videoResult = await videoAnalysis.analyzeVideo(videoFile.buffer.toString('base64'));

    let transcriptString = '';
    for (let index = 0; index < videoResult.annotationResults.length; index++) {
      if ('speechTranscriptions' in videoResult.annotationResults[index])
        var speech = videoResult.annotationResults[index].speechTranscriptions;
        for (const transcription of speech) {
          for (const alternative of transcription.alternatives) {
            transcriptString += alternative.transcript + ' ';
          }
        }
    }

    // Translate the transcript string
    const targetLanguage = 'tr';
    const translatedText = await translateText(transcriptString, targetLanguage);
    
    // Prepare the response data
    const response = {
      videoJSON: videoResult,
      translatedText: translatedText,
    };

    console.log(response);

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
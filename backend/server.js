const express = require('express');
const multer = require('multer');
const cors = require('cors');
const videoAnalysis = require('./VideoAnalysis');
const { translateText } = require('./Translate');

const app = express();
const upload = multer();

// Enable CORS for all routes
app.use(cors());

app.post('/upload', upload.single('video'), async (req, res) => {
  const videoFile = req.file; // Access the uploaded video file from req.file
  const selectedLanguageCode = req.body.language; // Access the selected language code from req.body

  console.log("Video File: ", videoFile);
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

    var translatedText = ''
    // Translate the transcript string
    if (transcriptString) {
      // Translate the transcript string
      const targetLanguage = selectedLanguageCode === '' ? 'tr' : selectedLanguageCode;
      translatedText = await translateText(transcriptString, targetLanguage);
    }

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
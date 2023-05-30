const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence');

// Instantiates a client
const videoClient = new VideoIntelligenceServiceClient();

// Analyzes the video using the Video Intelligence API
async function analyzeVideo(videoContent) {
    // Construct request for video analysis
    const request = {
        inputContent: videoContent,
        features: ['SPEECH_TRANSCRIPTION', 'OBJECT_TRACKING'],
        videoContext: {
          speechTranscriptionConfig: {
            languageCode: 'en-US',
            enableAutomaticPunctuation: true
          },
        },
      };

  console.log("analyzing...");
  const [operation] = await videoClient.annotateVideo(request);
  console.log('Waiting for operation to complete...');
  const [response] = await operation.promise();
  console.log("analyze completed.");
  console.log("response", response);

  let transcriptString = '';
  for (let index = 0; index < response.annotationResults.length; index++) {
    if ('speechTranscriptions' in response.annotationResults[index])
        var speech = response.annotationResults[index].speechTranscriptions
        for (const transcription of speech) {
            for (const alternative of transcription.alternatives) {
              //console.log(alternative.transcript, " ");
              transcriptString += alternative.transcript + ' ';
            }
        }
  }
  // we should put the text into translation api here.
  console.log("Transcript: ", transcriptString);

  return response;
}

module.exports = {
  analyzeVideo,
};
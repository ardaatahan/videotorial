const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence');

// Instantiates a client
const videoClient = new VideoIntelligenceServiceClient();

// Analyzes the video using the Video Intelligence API
async function analyzeVideo(videoContent) {
  const request = {
    inputContent: videoContent,
    features: ['LABEL_DETECTION'],
  };

  const [operation] = await videoClient.annotateVideo(request);
  const [response] = await operation.promise();

  return response.annotationResults[0].segmentLabelAnnotations;
}

module.exports = {
  analyzeVideo,
};
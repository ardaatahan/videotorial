const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence');

// Instantiates a client
const videoClient = new VideoIntelligenceServiceClient();

// Analyzes the video using the Video Intelligence API
async function analyzeVideo(videoContent) {
  const request = {
    inputContent: videoContent,
    features: ['LABEL_DETECTION', 'SPEECH_TRANSCRIPTION']
  };

  console.log("analyzing...");
  const [operation] = await videoClient.annotateVideo(request);
  console.log('Waiting for operation to complete...');
  const [response] = await operation.promise();
  console.log("analyze completed.");
  console.log("repsonse", response);
  return response;

  if (!response.annotationResults)
    return []

  for (let index = 0; index < response.annotationResults.length; index++) {
    if ('shotLabelAnnotations' in response.annotationResults[index])
      return response.annotationResults[index].shotLabelAnnotations
  }
  return []

  const labels = annotations.shotLabelAnnotations;
  labels.forEach(label => {
    console.log(`Label ${label.entity.description} occurs at:`);
    label.segments.forEach(segment => {
      const time = segment.segment;
      if (time.startTimeOffset.seconds === undefined) {
        time.startTimeOffset.seconds = 0;
      }
      if (time.startTimeOffset.nanos === undefined) {
        time.startTimeOffset.nanos = 0;
      }
      if (time.endTimeOffset.seconds === undefined) {
        time.endTimeOffset.seconds = 0;
      }
      if (time.endTimeOffset.nanos === undefined) {
        time.endTimeOffset.nanos = 0;
      }
      console.log(
        `\tStart: ${time.startTimeOffset.seconds}` +
        `.${(time.startTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(
        `\tEnd: ${time.endTimeOffset.seconds}.` +
        `${(time.endTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(`\tConfidence: ${segment.confidence}`);
    });
  });
  return labels;
}

module.exports = {
  analyzeVideo,
};

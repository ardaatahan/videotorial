const { Translate } = require('@google-cloud/translate').v2;

// Create an instance of the Translation API client
const translate = new Translate();

// Function to translate an array of labels
async function translateLabels(labels, targetLanguage) {
  try {
    // Extract the text to be translated from the labels array
    const texts = labels.map(label => label.description);

    // Detect the source language of the text
    const [detections] = await translate.detect(texts);
    const sourceLanguage = detections[0].language;

    // Translate the texts to the target language
    const [translations] = await translate.translate(texts, targetLanguage);

    // Create an array of translated labels
    const translatedLabels = translations.map((translation, index) => ({
      description: translation,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      originalLabel: labels[index]
    }));

    return translatedLabels;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

module.exports = {
  translateLabels
};

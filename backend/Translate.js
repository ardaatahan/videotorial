const { Translate } = require('@google-cloud/translate').v2;

const translateText = async (text, targetLanguage) => {
  const translate = new Translate();

  const [translation] = await translate.translate(text, targetLanguage);

  console.log('Translated Text:', translation);
};

module.exports = {
  translateText
};
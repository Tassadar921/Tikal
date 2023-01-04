//sends the json index of languages
function getLanguagesList(res) {
    const index = require('../files/json/translation/index.json');
    res.send(index);
}

//sends the json of the language id selectedLanguage
function getTranslation(language, res) {
    const translation = require('../files/json/translation/' + language + '.json');
    res.send(translation);
}
//sends the json index of languages
export async function getLanguagesList(res) {
    const index = await import('../files/json/translation/index.json', {assert: {type: 'json'}});
    res.json(index);
}

//sends the json of the language id selectedLanguage
export async function getTranslation(language, res) {
    const translation = await import('../files/json/translation/' + language + '.json', {assert: {type: 'json'}})
    res.json(translation);
}
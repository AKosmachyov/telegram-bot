const Markup = require('telegraf/markup');

function createLinkToBot(me, chatId) {
    return `https://telegram.me/${me}?start=from_${chatId}`;
}

function extractParams(startText) {
    const objParams = {};
    const params = startText.split(' ').slice(1);
    params.forEach(param => {
        const arr = param.split('_');
        objParams[arr[0]] = arr.length == 2 ? arr[1] : true;
    });
    return objParams;
}

function createPollMarkup(params) {
    const { pollId, options } = params;
    const keyboards = options.map(({title, value}) => [Markup.callbackButton(title, `poll_${pollId}_${value}`)]);
    return Markup.inlineKeyboard(keyboards).extra();
}

module.exports = {
    createLinkToBot,
    extractParams,
    createPollMarkup
}
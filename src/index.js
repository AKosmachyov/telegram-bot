const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

const config = require('../config.json');
const translation = require('./locales/ru.json');

require('./db/index');
const User = require('./db/User');

const keyboard = Markup.inlineKeyboard([
	Markup.urlButton('❤️', 'http://telegraf.js.org'),
	Markup.callbackButton('Delete', 'delete')
]);

const bot = new Telegraf(config.BOT_TOKEN);

bot.start((ctx) => {
    // TODO check user in the DB
    const { from: { id, first_name, last_name } } = ctx;
	const user = new User({
        userId: id,
        firstName: first_name,
        lastName: last_name,
		rooms: []
    });
    user.save();
    const {thankYou, forRegistration} = translation;
	ctx.reply(`${thankYou} ${forRegistration}, ${first_name}!`);
});
bot.help((ctx) => ctx.reply('Help message'););
bot.on('message', (ctx) => ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboard)));
bot.action('delete', ({ deleteMessage }) => deleteMessage());
bot.launch();

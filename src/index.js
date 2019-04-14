const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

const config = require('../config.json');
const translation = require('./locales/ru.json');
const utils = require('./utils');

const db = require('./db/index');
const User = require('./db/User');
const Chat = require('./db/Chat');

const keyboard = {
	keyboard: [ [ { text: 'На паре 👨🏼‍💻' }, { text: 'В пути 🚕' }, { text: 'Отсутствую 👣' } ] ],
	one_time_keyboard: true
};

const pollMarkup = Extra.markup(keyboard);

const bot = new Telegraf(config.BOT_TOKEN);

bot.context.db = db;

bot.on('new_chat_members', (ctx) => {
	const { me, message: { chat: { id, title, type }, new_chat_member: { username } } } = ctx;

	if (username === me) {
		const chat = new Chat({ chatId: id, users: [], title, type });
		chat.save();
		ctx.reply(`${translation.completeRegistration} https://telegram.me/${me}?start=from/${id}`);
	}
});

bot.start(async (ctx) => {
	const { thankYou, forRegistration } = translation;
	const { from: { id, first_name, last_name }, message: { text } } = ctx;

	const params = utils.extractParams(text);

	if (!params.from) {
		ctx.reply(translation.errorWrongRegistration);
	}

    const { from } = params;

	const user = await User.findOneAndUpdate(
		{ userId: id },
		{
			$set: {
				userId: id,
				firstName: first_name,
				lastName: last_name
			}
		},
		{ upsert: true, new: true }
    );
    
    const chat = await Chat.findOne({ chatId: from });
    if (chat && chat.users.indexOf(user.id) == -1) {
        chat.users.push(user);
        chat.save();
    }

	ctx.reply(`${thankYou} ${forRegistration}, ${first_name}!`);
});

bot.command('poll', (ctx) => {
	ctx.reply('Help message', Extra.markup(keyboard));
});

bot.command('test', (ctx) => {
	ctx.reply('Help message', Extra.markup(Markup.removeKeyboard()));
});

// bot.help((ctx) => ctx.reply('Help message'));
bot.on('message', async (ctx) => {
	ctx.reply('ok');
});
bot.launch();

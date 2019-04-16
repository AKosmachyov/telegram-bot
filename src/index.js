const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

const config = require('../config.json');
const translation = require('./locales/ru.json');
const utils = require('./utils');

const db = require('./db/index');

const pollOptions = [ 'На паре 👨🏼‍💻', 'В пути 🚕', 'Отсутствую 👣' ];

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
		ctx.db.Chat.addChat(id, title, type);
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

	const user = await ctx.db.User.updateUser(id, first_name, last_name);
	await ctx.db.Chat.addUser(from, user);
	ctx.reply(`${thankYou} ${forRegistration}, ${first_name}!`);
});

bot.command('poll', async (ctx) => {
	const { from: { id } } = ctx;
	const user = await ctx.db.User.getUser(id);
	const chats = await ctx.db.Chat.getUserChats(user.id);

	const chat = chats[0];

	// const options = pollOptions.map((el, i) => ({
		// title: el,
		// value: i
	// }));
	// await ctx.db.Poll.addPoll('Проверка присутствия', options, chat);

	ctx.reply(translation.pollStarted);

	chat.users.forEach(user => {
		ctx.telegram.sendMessage(user.userId, 'test', pollMarkup);
	});
	// ctx.reply('Help message', Extra.markup(keyboard));
});

bot.command('test', (ctx) => {
	ctx.reply('Help message', Extra.markup(Markup.removeKeyboard()));
});

// bot.help((ctx) => ctx.reply('Help message'));
bot.on('message', async (ctx) => {
	ctx.reply('ok');
});
bot.launch();

const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

const config = require('../config.json');
const translation = require('./locales/ru.json');
const utils = require('./utils');

const db = require('./db/index');

const pollOptions = [ 'На паре 👨🏼‍💻', 'В пути 🚕', 'Отсутствую 👣' ];

const bot = new Telegraf(config.BOT_TOKEN);

bot.context.db = db;
// bot.use(Telegraf.log());

bot.on('new_chat_members', (ctx) => {
	const { me, message: { chat: { id, title, type }, new_chat_member: { username } } } = ctx;

	if (username === me) {
		ctx.db.Chat.addChat(id, title, type);
		const botLink = utils.createLinkToBot(me, id);
		ctx.reply(`${translation.completeRegistration} ${botLink}`);
	}
});

bot.start(async (ctx) => {
	const { thankYou, forRegistration } = translation;
	const { from: { id, first_name, last_name }, message: { text } } = ctx;

	const params = utils.extractParams(text);

	if (!params.from) {
		return ctx.reply(translation.errorWrongRegistration);
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

	const options = pollOptions.map((el, i) => ({ title: el, value: i }));
	const poll = await ctx.db.Poll.addPoll('Проверка присутствия', options, chat);
	console.log(poll);
	ctx.reply(translation.pollStarted);
	
	const pollMarkup = utils.createPollMarkup({pollId: poll.id, options});
	chat.users.forEach(user => ctx.telegram.sendMessage(user.userId, poll.title, pollMarkup));
});

bot.command('test', (ctx) => {
	ctx.reply('Will close keyboard', Extra.markup(Markup.removeKeyboard()));
});

bot.action(/poll_(?<pollId>.*?)_(?<answer>.*)/, async (ctx) => {
	const { from: { id }, match: { groups: { pollId, answer } } } = ctx;
	const user = await ctx.db.User.getUser(id);
	await ctx.db.Poll.updateAnswer(pollId, user, answer);
	return ctx.answerCbQuery(translation.thanksForTheAnswer);
});

bot.action(/.+/, (ctx) => {
	return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`)
});

bot.launch();
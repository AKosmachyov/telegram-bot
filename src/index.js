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

	const chat = await ctx.db.Chat.getChat(from);
	const polls = await ctx.db.Poll.getActivePollsForChat(chat._id);
	polls.forEach(poll => sendPoll(ctx, [user], poll))
});

bot.command('poll', async (ctx) => {
	const { from: { id } } = ctx;
	const user = await ctx.db.User.getUser(id);
	const chats = await ctx.db.Chat.getUserChats(user.id);

	const chat = chats[0];

	const options = pollOptions.map((el, i) => ({ title: el, value: i }));
	const poll = await ctx.db.Poll.addPoll('Проверка присутствия', options, chat);
	ctx.reply(translation.pollStarted);
	
	sendPoll(ctx, chat.users, poll)
});

function sendPoll(ctx, users, poll) {
	const pollMarkup = utils.createPollMarkup({ pollId: poll.id, options: poll.options });
	users.forEach(user => ctx.telegram.sendMessage(user.userId, poll.title, pollMarkup));
}

bot.command('test', (ctx) => {
	ctx.reply('Will close keyboard', Extra.markup(Markup.removeKeyboard()));
});

bot.action(/poll_(?<pollId>.*?)_(?<answer>.*)/, async (ctx) => {
	const { from: { id }, match: { groups: { pollId, answer } } } = ctx;
	const user = await ctx.db.User.getUser(id);
	const poll = await ctx.db.Poll.getPoll(pollId);

	if (poll && poll.endDate > Date.now()) {
		await ctx.db.Poll.updateAnswer(poll, user, answer);
		return ctx.answerCbQuery(translation.thanksForTheAnswer);
	} else {
		return ctx.answerCbQuery(translation.pollUnavailable);
	}	
});

bot.launch();
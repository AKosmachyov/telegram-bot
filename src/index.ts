import Telegraf, { Extra, Markup, ContextMessageUpdate, Composer } from 'telegraf';

import { DataProvider, PollOption, User, Poll } from './dataProvider';
import mongooseProvider from './mongoose';
import { createLinkToBot, extractParams, createPollMarkup } from './utils';
import RUTranslates from './locales/ru';

const config = require('../config.json');

const pollOptions = [ 'На паре 👨🏼‍💻', 'В пути 🚕', 'Отсутствую 👣' ];

interface CustomContextMessageUpdate extends ContextMessageUpdate {
	dataProvider: DataProvider;
}

const bot: Telegraf<CustomContextMessageUpdate> = new Telegraf(config.BOT_TOKEN);

// bot.use((ctx, next) => {
// 	console.log(Date.now(), ctx.update);
// 	return next();
// });

bot.on('new_chat_members', (ctx) => {
	const { me, message: { chat: { id, title, type } } } = ctx;
	const botWasAdded = (ctx as any).message.new_chat_members.find((user) => user.username == me);
	if (!botWasAdded) {
		return;
	}
	ctx.dataProvider.addChat({
		telegramId: id,
		title: title,
		chatType: type
	});
	const botLink = createLinkToBot(me, id);
	ctx.reply(`${RUTranslates.completeRegistration} ${botLink}`);
});

bot.start(async (ctx) => {
	const { thankYou, forRegistration } = RUTranslates;
	const { from: { id, first_name, last_name }, message: { text } } = ctx;

	const user = await ctx.dataProvider.addOrUpdateUser({
		telegramId: id,
		firstName: first_name,
		lastName: last_name
	});

	const params: { from?: number } = extractParams(text);

	if (params.from) {
		const { from } = params;
		const chat = await ctx.dataProvider.getChat(from);
		await ctx.dataProvider.addUserForChat(chat.id, user);

		const polls = await ctx.dataProvider.getActivePollsForChat(chat.id);
		polls.forEach((poll) => sendPoll(ctx, [ user ], poll));
	}

	ctx.reply(`${thankYou} ${forRegistration}, ${first_name}!`);
});

bot.command('poll', async (ctx) => {
	const { from: { id } } = ctx;
	const user = await ctx.dataProvider.getUser(id);
	const chats = await ctx.dataProvider.getChatForUser(user.id);

	const chat = chats[0];

	const options: PollOption[] = pollOptions.map((el, i) => ctx.dataProvider.createPollOption(el, i.toString()));
	const poll = await ctx.dataProvider.addPoll({
		title: 'Проверка присутствия',
		chat: chat,
		pollOptions: options
	});
	ctx.reply(RUTranslates.pollStarted);
	sendPoll(ctx, chat.users, poll);
});

function sendPoll(ctx, users: User[], poll: Poll) {
	const pollMarkup = createPollMarkup({ pollId: poll.id, pollOptions: poll.pollOptions });
	users.forEach((user) => ctx.telegram.sendMessage(user.telegramId, poll.title, pollMarkup));
}

bot.command('test', (ctx) => {
	ctx.reply('Will close keyboard');
	// ctx.reply('Will close keyboard', Extra.markup(Markup.removeKeyboard()));
});

(bot as any).action(/poll_(?<pollId>.*?)_(?<answer>.*)/, async (ctx) => {
	const { from: { id }, match: { groups: { pollId, answer } } } = ctx;
	const user = await ctx.dataProvider.getUser(id);
	const poll = await ctx.dataProvider.getPoll(pollId);

	if (poll && Date.now() > poll.endDate) {
		return ctx.answerCbQuery(RUTranslates.pollUnavailable);
	}

	await ctx.dataProvider.addOrUpdateAnswer(poll, user, answer);
	return ctx.answerCbQuery(RUTranslates.thanksForTheAnswer);
});

bot.context.dataProvider = mongooseProvider;
bot.context.dataProvider.init().then(
	() => {
		console.log('Bot was started');
		bot.launch();
	},
	(err) => {
		console.error("Bot couldn't start", err);
	}
);

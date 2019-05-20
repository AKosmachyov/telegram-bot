import Telegraf, { Extra, Markup, ContextMessageUpdate, Composer } from 'telegraf';

import BOT from './bot';

const pollOptions = [ 'На паре 👨🏼‍💻', 'В пути 🚕', 'Отсутствую 👣' ];

import { PollOption } from './dataProvider';
import { extractParams, createResult, createPollInfo, sendPoll } from './utils';
import RUTranslates from './locales/ru';

BOT.start(async (ctx) => {
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

BOT.command('poll', async (ctx) => {
	const { from: { id } } = ctx;
	const user = await ctx.dataProvider.getUser(id);
	const chats = await ctx.dataProvider.getChatForUser(user.id);

	const chat = chats[0];

	const options: PollOption[] = pollOptions.map((el, i) => ctx.dataProvider.createPollOption(el, i.toString()));
	const poll = await ctx.dataProvider.addPoll({
		title: 'Проверка присутствия',
		chat: chat,
		pollOptions: options,
		user: user
	});
	await ctx.reply(RUTranslates.pollStarted);
	sendPoll(ctx, chat.users, poll);
});

(BOT as any).action(/poll_answer_(?<pollId>.*?)_(?<answer>.*)/, async (ctx) => {
	const { from: { id }, match: { groups: { pollId, answer } } } = ctx;
	const user = await ctx.dataProvider.getUser(id);
	const poll = await ctx.dataProvider.getPoll(pollId);

	if (!poll) {
		return ctx.answerCbQuery(RUTranslates.pollNotExist);
	}

	if (poll && Date.now() > poll.endDate) {
		return ctx.answerCbQuery(RUTranslates.pollUnavailable);
	}

	await ctx.dataProvider.addOrUpdateAnswer(poll, user, answer);
	return ctx.answerCbQuery(RUTranslates.thanksForTheAnswer);
});

(BOT as any).action(/poll_result_(?<pollId>.*)/, async (ctx) => {
	const pollId = ctx.match.groups.pollId;

	if (!pollId) {
		return ctx.answerCbQuery(RUTranslates.pollNotExist);
	}

	const poll = await ctx.dataProvider.getPoll(pollId, true);
	if (!poll) {
		ctx.answerCbQuery(RUTranslates.pollNotExist);
		return;
	}
	ctx.answerCbQuery('');
	ctx.reply(createResult(poll));
});

(BOT as any).action(/poll_remove_(?<pollId>.*)/, async (ctx) => {
	const { match: { groups: { pollId } }, callbackQuery: { message: { message_id } } } = ctx;
	if (!pollId) {
		return ctx.answerCbQuery(RUTranslates.pollNotExist);
	}

	await ctx.dataProvider.removePoll(pollId);
	ctx.deleteMessage(message_id);
	ctx.answerCbQuery('');
});

BOT.command('polls', async (ctx) => {
	const { from: { id } } = ctx;

	const user = await ctx.dataProvider.getUser(id);

	const polls = await ctx.dataProvider.getPollsForUser(user);

	if (polls.length == 0) {
		return ctx.reply(RUTranslates.noCreatedPollsForYou);
	}

	polls.forEach((poll) => {
		const options = createPollInfo(poll);
		ctx.reply(options.message, options.extra);
	});
});

BOT.context.dataProvider.init().then(
	() => {
		console.log('Bot was started');
		BOT.launch();
	},
	(err) => {
		console.error("Bot couldn't start", err);
	}
);

import BOT from './bot';

import { PollOption } from './dataProvider';
import { extractStartParams, createPollInfo, sendPoll, parseCommandParams, createChatInfo } from './utils';
import RUTranslates from './locales/ru';

// Start command
// examples:
// /start
// /start from_{telegramChatId}
BOT.start(async (ctx) => {
	const { thankYou, forRegistration } = RUTranslates;
    const { from: { id, first_name, last_name }, message: { text } } = ctx;

	const user = await ctx.dataProvider.addOrUpdateUser({
		telegramId: id,
		firstName: first_name,
		lastName: last_name
	});

	const params: { from?: number } = extractStartParams(text);

	if (params.from) {
		const { from } = params;
		const chat = await ctx.dataProvider.getChatByTelegramId(from);
		await ctx.dataProvider.addUserForChat(chat.id, user);

		const polls = await ctx.dataProvider.getActivePollsForChat(chat.id);
		polls.forEach((poll) => sendPoll(ctx, [ user ], poll));
		return;
	}

	ctx.reply(`${thankYou} ${forRegistration}, ${first_name}!`);
});

// Get chats for user
// example: /chats
BOT.command('chats', async (ctx) => {
    const { from: { id } } = ctx;

	const user = await ctx.dataProvider.getUser(id);
    const chats = await ctx.dataProvider.getChatForUser(user.id);

	if (chats.length == 0) {
		return ctx.reply(RUTranslates.noGroups);
	} else {
        ctx.replyWithMarkdown(createChatInfo(chats));
    }
});

// Create poll
// example:
// /poll {title_text} / {option1} ; {option2} / {chat_id}
BOT.command('poll', async (ctx) => {
	const { from: { id }, message: { text, entities: [ command ] } } = ctx;

	const [ title, pollOptions, chatId ] = parseCommandParams(text, command.length) as [string, string[], string];

	if (!title || !pollOptions || !chatId || !ctx.dataProvider.isValidId(chatId)) {
		return ctx.reply('Error');
	}

	//TODO check permissions for chat
	const user = await ctx.dataProvider.getUser(id);
	const chat = await ctx.dataProvider.getChat(chatId, true);

	if (!chat) {
		return ctx.reply('Error');
	}

	const options: PollOption[] = pollOptions.map((el, i) => ctx.dataProvider.createPollOption(el, i.toString()));
	const poll = await ctx.dataProvider.addPoll({
		title: title,
		chat: chat,
		pollOptions: options,
		user: user
	});
	await ctx.reply(RUTranslates.pollStarted);
	sendPoll(ctx, chat.users, poll);
});

// Get all polls for user
// example:
// /polls
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

// Send Menu when user send the /help command or message
BOT.command('help', (ctx) => ctx.replyWithMarkdown(RUTranslates.menu));
BOT.on('text', (ctx) => ctx.replyWithMarkdown(RUTranslates.menu));
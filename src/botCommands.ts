import BOT from './bot';

import { PollOption, Chat } from './dataProvider';
import { extractStartParams, parseCommandParams, createPollDetailsMarkup, sendPollForUsers, createChatInfoMarkup, createLinkToBot } from './utils';
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

	const params: { from?: number, poll?: string } = extractStartParams(text);

	if (params.from) {
		const { from } = params;
		const chat = await ctx.dataProvider.getChatByTelegramId(from);
		await ctx.dataProvider.addUserForChat(chat.id, user);

		const polls = await ctx.dataProvider.getActivePollsForChat(chat.id);
		polls.forEach((poll) => sendPollForUsers(ctx, [ user ], poll));
		return;
	}

	if (ctx.dataProvider.isValidId(params.poll)) {
		const { poll: pollId } = params;

		const poll = await ctx.dataProvider.getPoll(pollId);

		if (poll) {
			sendPollForUsers(ctx, [ user ], poll);
			return;
		}
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
		ctx.replyWithMarkdown(createChatInfoMarkup(chats));
	}
});

// Create poll
// example:
// /poll {title_text} / {option1} ; {option2} / {chat_id}
// /poll {title_text} / {option1} ; {option2}
BOT.command('poll', async (ctx) => {
	const { me, from: { id }, message: { text, entities: [ command ] } } = ctx;

	const [ title, pollOptions, chatId ] = parseCommandParams(text, command.length) as [string, string[], string];

	if (!title || !Array.isArray(pollOptions) || pollOptions.length == 0) {
		return ctx.reply(`${RUTranslates.syntaxError} \n${RUTranslates.commands.pollComand}`);
	}

	let pollChat: Chat | undefined;

	if (ctx.dataProvider.isValidId(chatId)) {
		const chat = await ctx.dataProvider.getChat(chatId, true);
		if (!chat) {
			return ctx.reply(RUTranslates.noGroups);
		}
		pollChat = chat;
	}

	//TODO check permissions for chat
	const user = await ctx.dataProvider.getUser(id);

	const options: PollOption[] = pollOptions.map((el, i) => ctx.dataProvider.createPollOption(el, i.toString()));
	const poll = await ctx.dataProvider.addPoll({
		title: title,
		chat: pollChat,
		pollOptions: options,
		user: user
	});

	const pollLink = !pollChat ? createLinkToBot(me, { pollId: poll.id }) : '';

	await ctx.reply(`${RUTranslates.pollStarted} ${pollLink}`);

	if (pollChat) {
		sendPollForUsers(ctx, pollChat.users, poll);	
	}
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
		const options = createPollDetailsMarkup(poll);
		ctx.reply(options.message, options.extra);
	});
});

// Send Menu when user send the /help command or message
BOT.command('help', (ctx) => ctx.replyWithMarkdown(RUTranslates.menu));
BOT.on('text', (ctx) => ctx.replyWithMarkdown(RUTranslates.menu));

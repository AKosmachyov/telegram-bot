import BOT from './bot';
import RUTranslates from './locales/ru';
import { createPollResultMarkup, createPollDetailsMarkup } from './utils';

// Set answer for poll
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

// Get result for poll
(BOT as any).action(/poll_result_(?<pollId>.*)/, async (ctx) => {
	const pollId = ctx.match.groups.pollId;

	if (!pollId) {
		return ctx.answerCbQuery(RUTranslates.pollNotExist);
	}

	const poll = await ctx.dataProvider.getPoll(pollId, true);

	if (!poll) {
		return ctx.answerCbQuery(RUTranslates.pollNotExist);
	}

	ctx.answerCbQuery('');
	if (poll.answers.length) {
		ctx.reply(createPollResultMarkup(poll));
	} else {
		ctx.reply(RUTranslates.noAnswersForPoll);
	}
});

// Remove poll
(BOT as any).action(/poll_remove_(?<pollId>.*)/, async (ctx) => {
	const { match: { groups: { pollId } }, callbackQuery: { message: { message_id } } } = ctx;
	if (!pollId) {
		return ctx.answerCbQuery(RUTranslates.pollNotExist);
	}

	await ctx.dataProvider.removePoll(pollId);
	ctx.deleteMessage(message_id);
	ctx.answerCbQuery('');
});

// Refresh the poll info
(BOT as any).action(/poll_refresh_(?<pollId>.*)/, async (ctx) => {
	const pollId = ctx.match.groups.pollId;

	if (!pollId) {
		return ctx.answerCbQuery(RUTranslates.pollNotExist);
	}

	const poll = await ctx.dataProvider.getPoll(pollId);

	if (!poll) {
		return ctx.answerCbQuery(RUTranslates.pollNotExist);
	}

	const markup = createPollDetailsMarkup(poll);

	ctx.editMessageText(markup.message, markup.extra)

	ctx.answerCbQuery(RUTranslates.completed);
});

import { Markup, Extra } from 'telegraf';
import { PollOption, Poll, User, Chat } from './dataProvider';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import RUTranslates from './locales/ru';

export function createLinkToBot(botName: string, options: { telegramChatId?: number; pollId?: string }): string {
	const { telegramChatId, pollId } = options;
	if (telegramChatId) {
		return `https://telegram.me/${botName}?start=from_${telegramChatId}`;
	}

	if (pollId) {
		return `https://telegram.me/${botName}?start=poll_${pollId}`;
	}
}

export function extractStartParams(startText) {
	const objParams = {};
	const params = startText.split(' ').slice(1);
	params.forEach((param) => {
		const [ key, value ] = param.split('_');
		objParams[key] = value || true;
	});
	return objParams;
}

export function parseCommandParams(text: string, startFrom: number): Array<string | string[]> {
	const textParams = text.slice(startFrom);
	return textParams.split('/').map((el) => {
		// pars embeded array
		if (el.indexOf(';') > -1) {
			return el.split(';').map((el) => el.trim());
		}
		return el.trim();
	});
}

export function sendPollForUsers(ctx, users: User[], poll: Poll) {
	const pollMarkup = createPollAnswerMarkup({ pollId: poll.id, pollOptions: poll.pollOptions });
	users.forEach((user) => ctx.telegram.sendMessage(user.telegramId, poll.title, pollMarkup));
}

export function createPollAnswerMarkup(options: { pollId: string; pollOptions: PollOption[] }) {
	const { pollId, pollOptions } = options;
	const keyboards = pollOptions.map(({ title, value }) => [
		Markup.callbackButton(title, `poll_answer_${pollId}_${value}`)
	]);
	return (Markup.inlineKeyboard(keyboards) as any).extra();
}

export function createPollDetailsMarkup(poll: Poll): { message: string; extra: ExtraReplyMessage } {
	let date = new Date(poll.createDate);
	const answersCount = poll.answers.length;
	const message = `${date.toLocaleDateString('ru')} ${poll.title} \n${RUTranslates.answered}: ${answersCount}`;

	const buttons = [
		[ Markup.callbackButton(`👀 ${RUTranslates.results}`, `poll_result_${poll.id}`, answersCount == 0) ],
		[ Markup.callbackButton(`⟳ ${RUTranslates.refresh}`, `poll_refresh_${poll.id}`) ],
		[ Markup.callbackButton(`🗑 ${RUTranslates.remove}`, `poll_remove_${poll.id}`) ]
	];

	const extra = Extra.markup((m) => m.inlineKeyboard(buttons)) as ExtraReplyMessage;
	return {
		message,
		extra
	};
}

export function createPollResultMarkup(poll: Poll): string {
	const mapSource: [string, string][] = poll.pollOptions.map((el) => [ el.value, el.title ]);
	const answersMap = new Map(mapSource);
	const arr = poll.answers.map((userAnswer, index) => {
		const answer = answersMap.get(userAnswer.answer) || userAnswer.answer;
		const { lastName, firstName, userName } = userAnswer.user;
		const name = (lastName && firstName) ? `${lastName} ${firstName}` : `@${userName}`;
		return `${index + 1}) ${name}: ${answer}`;
	});
	return arr.join('\n');
}

export function createChatInfoMarkup(chats: Chat[]): string {
	const chatInfo = chats.map((chat, i) => `${i + 1}) ${chat.title} ${chat.id}`);
	return chatInfo.join('\n');
}

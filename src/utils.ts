import { Markup } from 'telegraf';
import { PollOption, Poll } from './dataProvider';

export function createLinkToBot(me, chatId): string {
	return `https://telegram.me/${me}?start=from_${chatId}`;
}

export function createResult(poll: Poll): string {
	const arr = poll.answers.map((userAnswer, index) => {
		const option = poll.pollOptions.find((el) => el.value == userAnswer.answer);
		const answer = !!option ? option.title : userAnswer.answer;
		return `${index + 1}) ${userAnswer.user.lastName} ${userAnswer.user.firstName}: ${answer}`;
	});
	return arr.join('\n');
}

export function extractParams(startText) {
	const objParams = {};
	const params = startText.split(' ').slice(1);
	params.forEach((param) => {
		const [ key, value ] = param.split('_');
		objParams[key] = value || true;
	});
	return objParams;
}

export function createPollMarkup(options: { pollId: string; pollOptions: PollOption[] }) {
	const { pollId, pollOptions } = options;
	const keyboards = pollOptions.map(({ title, value }) => [
		Markup.callbackButton(title, `poll_${pollId}_${value}`)
	]);
	return (Markup.inlineKeyboard(keyboards) as any).extra();
}

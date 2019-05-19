import { Markup } from 'telegraf';
import { PollOption } from './dataProvider';

export function createLinkToBot(me, chatId): string {
	return `https://telegram.me/${me}?start=from_${chatId}`;
}

export function extractParams(startText) {
	const objParams = {};
	const params = startText.split(' ').slice(1);
	params.forEach((param) => {
		const arr = param.split('_');
		objParams[arr[0]] = arr.length == 2 ? arr[1] : true;
	});
	return objParams;
}

export function createPollMarkup(options: { pollId: number; pollOptions: PollOption[] }) {
	const { pollId, pollOptions } = options;
	const keyboards = pollOptions.map(({ title, value }) => [
		Markup.callbackButton(title, `poll_${pollId}_${value}`)
	]);
	return (Markup.inlineKeyboard(keyboards) as any).extra();
}
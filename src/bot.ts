import Telegraf, { ContextMessageUpdate } from 'telegraf';

import { DataProvider } from './dataProvider';
import mongooseProvider from './mongoose';
import { createLinkToBot } from './utils';
import RUTranslates from './locales/ru';

const config = require('../config.json');

interface CustomContextMessageUpdate extends ContextMessageUpdate {
	dataProvider: DataProvider;
}

const bot: Telegraf<CustomContextMessageUpdate> = new Telegraf(config.BOT_TOKEN);
bot.context.dataProvider = mongooseProvider;

// bot.use((ctx, next) => {
// 	ctx.reply('__');
// 	// return next();
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
	const botLink = createLinkToBot(me, {telegramChatId: id});
	ctx.reply(`${RUTranslates.completeRegistration} ${botLink}`);
});

bot.on('left_chat_member', (ctx) => {
	const { me, message: { chat: { id } } } = ctx;
	const botWasRemoved = (ctx as any).message.left_chat_member.username == me;
	if (botWasRemoved) {
		ctx.dataProvider.removeChat(id);
	}
});

export default bot;
export function init(): Promise<void> {
	return Promise.all([ bot.context.dataProvider.init(), bot.launch() ]).then(
		() => console.log('Bot was started'),
		(err) => console.error("Bot couldn't start", err)
	);
}

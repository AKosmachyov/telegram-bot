export interface DataProvider {
	init(): Promise<any>;

	addChat(options: { telegramId: number; title: string; chatType: string }): Promise<Chat>;
	getChat(telegramId: number): Promise<Chat>;
	getChatForUser(userId: string): Promise<Chat[]>;
	addUserForChat(chatId: string, user: User): Promise<void>;
	removeChat(telegramId: number): Promise<void>;

	getUser(telegramId: number): Promise<User>;
	addOrUpdateUser(options: { telegramId: number; firstName: string; lastName: string }): Promise<User>;

	addPoll(options: { title: string; chat: Chat; pollOptions: PollOption[], user: User}): Promise<Poll>;
	getPoll(id: string, withUser?: boolean): Promise<Poll>;
	getActivePollsForChat(id: string): Promise<Poll[]>;
	getPollsForUser(user: User): Promise<Poll[]>;
	addOrUpdateAnswer(poll: Poll, user: User, answer: string): Promise<PollAnswer>;
	removePoll(id: string): Promise<void>;

	createPollOption(title: string, value: string): PollOption;
}

export interface Chat {
	id: string;
	telegramId: number;
	title: string;
	chatType: string;
	users: User[];
}

export interface User {
	id: string;
	telegramId: number;
	firstName: string;
	lastName: string;
}

export interface Poll {
	id: string;
	chat: Chat;
	title: string;
	owner: User;
	createDate: Date;
	endDate: Date;
	pollOptions: PollOption[];
	answers: PollAnswer[];
}

type PollValue = string;

export interface PollOption {
	title: string;
	value: PollValue;
}

export interface PollAnswer {
	id: string;
	user: User;
	answer: PollValue;
}

export interface DataProvider {
    init(): Promise<any>;

    addChat(options: { telegramId: number, title: string, chatType: string }): Promise<Chat>;
    getChat(id: number): Promise<Chat>;
    getChatForUser(userId: number): Promise<Chat[]>;
    addUserForChat(id: number, user: User): Promise<void>;
    
    getUser(telegramId: number): Promise<User>;
    addOrUpdateUser(user: User): Promise<void>;
    
    addPoll(poll: Poll): Promise<Poll>;
    getPoll(id: number): Promise<Poll>;
    getActivePollsForChat(id: number): Promise<Poll>;
    addOrUpdateAnswer(poll: Poll, user: User, answer: string): Promise<PollAnswer>;
}

export interface Chat {
	id: number;
	telegramId: number;
	title: string;
	chatType: string;
	users: User[];
}

export interface User {
	id: number;
	telegramId: number;
	firstName: string;
	lastName: string;
}

export interface Poll {
	id: number;
	chat: Chat;
	title: string;
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
	id: number;
	user: User;
	answer: PollValue;
}

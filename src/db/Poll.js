const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
	chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    createDate: Date,
    endDate: Date,
	title: String,
	options: [
		{
			title: String,
			value: String
		}
	],
	answers: [
		{
			user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
			value: String
		}
	]
});
const Poll = mongoose.model('Poll', PollSchema);

function addPoll(title, options, chat) {
    const createDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 1);

    const poll = new Poll({
        title,
        options,
        chat,
        createDate: createDate,
        endDate: endDate.toISOString()
    });
    return poll.save();
}

function getPoll(pollId) {
	return Poll.findOne({_id: pollId});
}

function getActivePollsForChat(chatId) {
	return Poll.find({ chat: chatId, endDate: { $gt: Date.now() } });
}

async function updateAnswer(poll, user, answerOption) {
	const answer = poll.answers.find(answer => answer.user.equals(user.id));
	if (answer) {
		 answer.value = answerOption;
	} else {
		poll.answers.push( { value: answer, user: user } )
	}
	return await poll.save();
}

module.exports = {
	getPoll,
	getActivePollsForChat,
	addPoll,
	updateAnswer
};

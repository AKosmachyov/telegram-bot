const pollComand = '/poll *Текст опроса* / *вариант 1* ; *вариант 2* / *chat id*';
const menu = `
/chats - получить чаты
/polls - посмотреть результаты опросов
${pollComand} - создать опрос
/help - получить список доступных команд
`;

export default {
	thankYou: 'Большое спасибо',
	forRegistration: 'за регистрацию',
	completeRegistration: 'Пройдите пожалуйста регистрацию: ',
	errorWrongRegistration: 'Ошибка: попробуйте перейти по ссылке ещё раз',
	pollStarted: 'Ваш опрос создан',
	thanksForTheAnswer: 'Спасибо! Ваш ответ принят',
	pollUnavailable: 'Опрос больше недоступен',
	pollNotExist: 'Данный опрос не найден!',
	noCreatedPollsForYou: 'Вы еще не создавали опросы',
	noAnswersForPoll: 'На данный опрос ещё нету ответов',
	noGroups: 'Бот не был добавлен в группы',
	invalidParameters: 'Команда указана неверно',
	results: 'Результаты',
	remove: 'Удалить',
	refresh: 'Обновить',
	completed: 'Выполнено',
	answered: 'Ответили',
	menu: menu
};

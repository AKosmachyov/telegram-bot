# Poll bot for Telegram

##### Analogs

- `@vote` - in the results shows only the nickname of the telegram, and not the first name with the last name of the user;
- `@PollBot` - only works after adding to group.

## Available commands

### Start

The `from_{telegramChatId}` used to link the user with the chat. The bot sends a message with a link when it was added to the chat.

The `poll_{pollId}` used to show a poll for userю
```
/start
/start from_{telegramChatId}
/start poll_{pollId}
```

### Get shared user chats with a bot
With this command, the user can find `chat_id` to create a chat poll.
```
/chats
```

### Create poll
Params should be separated by `/`. Poll answer options also should be separated by `;`.
- `{title_text}` - poll title;
- `{option1}` - answer option;
- `{chat_id}` - the chat id. The poll will linked to the chat. This means that chat users will receive a message with this poll.
```
/poll {title_text} / {option1} ; {option2} / {chat_id}
/poll {title_text} / {option1} ; {option2}
```

### Get user polls
```
/polls
```
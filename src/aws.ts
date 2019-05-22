import BOT from './bot';
require('./botCommands');
require('./botActions');
import mongooseProvider from './mongoose';

let conn = null;

exports.handler = async (event, context, callback) => {
    // Make sure to add this so you can re-use `conn` between function calls.
    // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
    context.callbackWaitsForEmptyEventLoop = false;

    if (conn == null) {
        conn = await mongooseProvider.init();
    }

    const tmp = JSON.parse(event.body); // get data passed to us
    BOT.handleUpdate(tmp); // make Telegraf process that data
    // return something for webhook, so it doesn't try to send same stuff again
    return callback(null, { statusCode: 200, body: ''});
  };
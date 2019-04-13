const mongoose = require('mongoose');
const config = require('../../config.json');

mongoose.connect(config.DB_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', (err) => console.error('connection error:', err));
db.once('open', () => console.log('DB connected'));
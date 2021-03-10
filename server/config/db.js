const mongoose = require('mongoose');
const dbURI = process.env.DB_URI;

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
mongoose.set('useCreateIndex', true);
const connection = mongoose.connection;

connection.on('connected', console.log.bind(console, 'Mongoose connected to ' + dbURI));
connection.on('error', console.error.bind(console, 'Mongoose connection error: ') );
connection.on('disconnected', console.log.bind(console, 'Mongoose disconnected') );

//Handle all possible shutdown events
//For Nodemon restarts:
process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart').then(() => {
        process.kill(process.pid, 'SIGUSR2');
    });
});
//For app termination:
process.on('SIGINT', function () {
    gracefulShutdown('app termination').then(() => {
        process.exit(0);
    });
});
//For Heroku app termination:
process.on('SIGTERM', function () {
    gracefulShutdown('Heroku app shutdown').then(() => {
        process.exit(0);
    });
});
//Helper function
function gracefulShutdown (msg, callback) {
    return mongoose.connection.close().then(() => {
        console.log('Mongoose disconnected through ' + msg);
        if (callback != undefined) callback();
    });
};
var path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
// require('./config/db');

//---------------------------------------------------------------------------------------------------------------------------
//-------------SERVER STUFF--------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------
var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var routes = require('./routes/index');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//======================CORS===================================================================================
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});
//======================For unrestricted access to browser based clients (remove in production)================

app.use('/v1', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err)

  return res.send({
    status: err.status,
    err: {
      message: err.message
    }
  });
});

module.exports = { app };
const createError = require('http-errors');
const httpStatus = require('http-status');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const appConfig = require('./config');

// const indexRouter = require('./routes/index');
const peoplesRouter = require('./routes/peoples');
const schedulesRouter = require('./routes/schedules');
const messagesRouter = require('./routes/messages');

mongoose.connect(appConfig.mongodb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/peoples', peoplesRouter);
app.use('/schedules', schedulesRouter);
app.use('/messages', messagesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err instanceof mongoose.Error) {
    if (err.kind === 'ObjectId') {
      err = new Error('Object not found.');
      err.status = httpStatus.NOT_FOUND;
    }
  } else if (typeof err.status === 'undefined') {
    err = new Error('Internal server error.');
    err.status = httpStatus.INTERNAL_SERVER_ERROR;
  }

  res
    .status(err.status)
    .json({
      message: err.message,
      code: err.status
    });
});

module.exports = app;

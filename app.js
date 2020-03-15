const createError = require('http-errors');
const httpStatus = require('http-status');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const appConfig = require('./config');
const APIError = require('./utils/APIError');

// const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const peoplesRouter = require('./routes/peoples');
const schedulesRouter = require('./routes/schedules');
const messagesRouter = require('./routes/messages');
const chatfuelRouter = require('./routes/chatfuel');

mongoose.Promise = Promise;
mongoose.connect(appConfig.mongoURI, {
  useNewUrlParser: true,
  keepAlive: 1,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/peoples', peoplesRouter);
app.use('/schedules', schedulesRouter);
app.use('/messages', messagesRouter);
app.use('/chatfuel', chatfuelRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  let convertedError = err;
  if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err.status,
      stack: err.stack,
    });
  }

  const response = {
    code: convertedError.status,
    message: convertedError.message || httpStatus[convertedError.status],
    errors: convertedError.errors,
    // stack: convertedError.stack,
  };

  // if (req.app.get('env') !== 'development') {
  //   delete response.stack;
  // }

  res.status(convertedError.status);
  res.json(response);
});

module.exports = app;

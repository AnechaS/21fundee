const express = require('express');

const authRouter = require('./auth');
const userRouters = require('./user');
const peopleRouters = require('./people');
const scheduleRouters = require('./schedule');
const questionRouters = require('./question');
const messageRouters = require('./message');
const chatfuelRouters = require('./chatfuel');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouters);
router.use('/peoples', peopleRouters);
router.use('/schedules', scheduleRouters);
router.use('/questions', questionRouters);
router.use('/messages', messageRouters);
router.use('/chatfuel', chatfuelRouters);

module.exports = router;

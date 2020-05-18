const express = require('express');

const authRouter = require('./auth');
const userRouters = require('./user');
const commentRouters = require('./comment');
const peopleRouters = require('./people');
const scheduleRouters = require('./schedule');
const questionRouters = require('./question');
const replyRouters = require('./reply');
const quizRouters = require('./quiz');
const progressRouters = require('./progress');
const chatfuelRouters = require('./chatfuel');
const dashboardRoutes = require('./dashboard');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouters);
router.use('/comments', commentRouters);
router.use('/peoples', peopleRouters);
router.use('/schedules', scheduleRouters);
router.use('/questions', questionRouters);
router.use('/replies', replyRouters);
router.use('/quizzes', quizRouters);
router.use('/progresses', progressRouters);
router.use('/dashboards', dashboardRoutes);
router.use('/chatfuel', chatfuelRouters);

module.exports = router;

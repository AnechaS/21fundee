const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');

const Schedule = require('../models/schedule.model');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const schedule = await Schedule.findById(id);
      if (schedule) {
        req.schedule = schedule;
        return next();
      }
    }

    // object id is not exists
    throw new APIError({
      message: 'Object not found.',
      status: httpStatus.NOT_FOUND
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {get} /schedules List Schedules
 * @apiDescription Get a list of schedules
 * @apiName ListSchedules
 * @apiGroup Schedule
 */
router.get('/', authorize(), async (req, res, next) => {
  try {
    const schedule = await Schedule.find().limit(2000);
    return res.json(schedule);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {post} /schedules Create Schedule
 * @apiDescription Create a new schedule
 * @apiName CreateSchedule
 * @apiGroup Schedule
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const schedule = await Schedule.create(object);
    return res.status(httpStatus.CREATED).json(schedule);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {get} /schedules/:id Get Schedule
 * @apiDescription Get schedule information
 * @apiName GetSchedule
 * @apiGroup Schedule
 */
router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const schedule = req.schedule;
    return res.json(schedule);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {put} /schedules/:id Update Schedule
 * @apiDescription Update some fields of a schedule document
 * @apiName UpdateSchedule
 * @apiGroup Schedule
 *
 * TODO Update _id
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const schedule = Object.assign(req.schedule, object);
    const savedSchedule = await schedule.save();
    return res.json(savedSchedule);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {delete} /peoples/:id Delete Schedule
 * @apiDescription Delete a schedule
 * @apiName DeleteSchedule
 * @apiGroup Schedule
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const schedule = req.schedule;
    await schedule.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

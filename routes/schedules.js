const express = require('express');
const httpStatus = require('http-status');
const Schedule = require('../models/schedule');
const router = express.Router();

/**
 * @api {get} /schedules List Schedules
 * @apiDescription Get a list of schedules
 * @apiName ListSchedules
 * @apiGroup Schedule
 */
router.get('/', async (req, res, next) => {
  try {
    const schedule = await Schedule.find();
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
router.post('/', async (req, res, next) => {
  try {
    const schedule = await Schedule.create(req.body);
    return res
      .status(httpStatus.CREATED)
      .json(schedule);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {put} /schedules/:id Update Schedule
 * @apiDescription Update some fields of a schedule document
 * @apiName UpdateSchedule
 * @apiGroup Schedule
 */
router.put('/:id', async(req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    return res.json(schedule);
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
router.delete('/:id', async(req, res, next) => {
  try {
    await Schedule.deleteOne({ _id: req.params.id });
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');

const Reply = require('../models/reply.model');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const reply = await Reply.findById(id);
      if (reply) {
        req.reply = reply;
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
 * List replies
 * @api {get} /replies
 */
router.get('/', authorize(), async (req, res, next) => {
  try {
    const reply = await Reply.find()
      .limit(2000)
      .populate('people')
      .populate('schedule');
    return res.json(reply);
  } catch (error) {
    return next(error);
  }
});

/**
 * Create a new reply
 * @api {post} /replies
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const reply = await Reply.create(object);
    return res.status(httpStatus.CREATED).json(reply);
  } catch (error) {
    return next(error);
  }
});

/**
 * Create reply infomation
 * @api {post} /replies
 */
router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const reply = await req.reply
      .populate('people')
      .populate('schedule')
      .execPopulate();
    return res.json(reply);
  } catch (error) {
    return next(error);
  }
});

/**
 * Update reply
 * @api {put} /replies/:id
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const reply = Object.assign(req.reply, object);
    const savedReply = await reply.save();
    return res.json(savedReply);
  } catch (error) {
    return next(error);
  }
});

/**
 * Delete a reply
 * @api {delete} /replies/:id
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const reply = req.reply;
    await reply.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

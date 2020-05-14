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
 * @api {get} /replys List Replys
 * @apiDescription Get a list of quiz
 * @apiName ListReplys
 * @apiGroup Reply
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
 * @api {post} /replys Create Reply
 * @apiDescription Create a new reply
 * @apiName CreateReply
 * @apiGroup Reply
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
 * @api {put} /replys/:id Update Reply
 * @apiDescription Update some fields of a reply document
 * @apiName UpdateReply
 * @apiGroup Reply
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
 * @api {delete} /replys/:id Delete a schedule
 * @apiDescription Delete a schedule
 * @apiName DeleteReply
 * @apiGroup Reply
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

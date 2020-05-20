const express = require('express');
const httpStatus = require('http-status');
const People = require('../models/people.model');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (id.trim().length) {
      const people = await People.findById(id);
      if (people) {
        req.people = people;
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
 * List Peoples
 * @api {get} /peoples
 */
router.get('/', authorize(), async (req, res, next) => {
  try {
    const peoples = await People.find().limit(2000);
    return res.json(peoples);
  } catch (error) {
    return next(error);
  }
});

/**
 * Create a new people
 * @api {post} /peoples
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const people = await People.create(object);
    return res.status(httpStatus.CREATED).json(people);
  } catch (error) {
    return next(error);
  }
});

/**
 * Get people information
 * @api {get} /peoples/:id
 */
router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const people = req.people;
    return res.json(people);
  } catch (error) {
    return next(error);
  }
});

/**
 * Update people
 * @api {put} /peoples/:id
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const people = Object.assign(req.people, object);
    const savedPeople = await people.save();
    return res.json(savedPeople);
  } catch (error) {
    return next(error);
  }
});

/**
 * Delete a people
 * @api {delete} /peoples/:id
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const people = req.people;
    await people.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

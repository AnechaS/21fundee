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
      status: httpStatus.NOT_FOUND,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {get} /peoples List Peoples
 * @apiDescription Get a list of peoples
 * @apiName ListPeoples
 * @apiGroup People
 */
router.get('/', authorize(), async (req, res, next) => {
  try {
    const peoples = await People.find();
    return res.json(peoples);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {post} /peoples Create Peoples
 * @apiDescription Create a new people
 * @apiName CreatePeople
 * @apiGroup People
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
 * @api {get} /peoples/:id Get people
 * @apiDescription Get people information
 * @apiName Getpeople
 * @apiGroup people
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
 * @api {put} /peoples/:id Update People
 * @apiDescription Update some fields of a people document
 * @apiName UpdatePeople
 * @apiGroup People
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const people = Object.assign(req.people, object);
    const savedPeople = await people.save();
    return res.json(savedPeople);
  } catch (error) {
    console.log(error);

    return next(error);
  }
});

/**
 * @api {delete} /peoples/:id Delete People
 * @apiDescription Delete a people
 * @apiName DeleteUser
 * @apiGroup People
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

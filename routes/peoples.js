const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const People = require('../models/people');
const APIError = require('../utils/APIError');
const { removeRequestBodyWithNull } = require('../middlewares');

const router = express.Router();

/**
 * @api {get} /peoples List Peoples
 * @apiDescription Get a list of peoples
 * @apiName ListPeoples
 * @apiGroup People
 */
router.get('/', async (req, res, next) => {
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
 * 
 * @apiPermission IP Chatfuel
 */
router.post('/',  
  removeRequestBodyWithNull,
  async (req, res, next) => {
    try {
      const body = req.body;
      if (typeof body._id !== 'undefined') {
        // update the people if object id exists
        let id = body._id;
        delete body._id;

        const people = await People.findByIdAndUpdate(id, body, {
          upsert: true,
          new: true,
          // overwrite: true
        });

        return res
          .status(httpStatus.CREATED)
          .json(people);
      }

      // create a new people
      const people = await People.create(body);
      return res
        .status(httpStatus.CREATED)
        .json(people);
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
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const people = await People.findByIdAndUpdate(
        id, 
        { $set: req.body }, 
        { new: true }
      );
      if (people) {
        return res.json(people); 
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
 * @api {delete} /peoples/:id Delete People
 * @apiDescription Delete a people
 * @apiName DeleteUser
 * @apiGroup People
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const people = await People.findByIdAndRemove(id);
      if (people) {
        return res.status(httpStatus.NO_CONTENT).end();
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

module.exports = router;

const express = require('express');
const httpStatus = require('http-status');
const People = require('../models/people');
const { handleRemoveRequestBodyWithNull } = require('../middlewares');

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
  handleRemoveRequestBodyWithNull,
  async (req, res, next) => {
    const body = req.body;
    if (typeof body.eUserId === 'undefined') {
      return res.status(400).json({
        message: 'Invalid messenger user id.'
      });
    }

    try {
      const people = await People.findOne({
        eUserId: body.eUserId
      });

      // create a new people if not exists
      if (!people) {
        const newPeople = await People.create(body);
        return res
          .status(httpStatus.CREATED)
          .json(newPeople);
      }
  
      // update the people if exists
      Object.keys(body).forEach(val => {
        people[val] = body[val];
      });
  
      const newPeople = await people.save();
      return res
        .status(httpStatus.CREATED)
        .json(newPeople);
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
    const people = await People.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    return res.json(people); 
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
    await People.deleteOne({ _id: req.params.id });
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

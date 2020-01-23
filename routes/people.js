const express = require('express');
const _ = require('lodash');
const People = require('../models/people');
const removeRequestBodyWithNull = require('../utils/removeRequestBodyWithNull');

const router = express.Router();

// TODO api response error

router.get('/', async (req, res, next) => {
  const peoples = await People.find();
  res.json(peoples);
});

router.post('/', async (req, res) => {
  const body = removeRequestBodyWithNull(req.body);
  if (typeof body.messengerUserId === 'undefined') {
    return res.status(400).json({
      message: 'invalid messenger user id'
    });
  }

  const people = await People.findOne({
    messengerUserId: body.messengerUserId
  });
  if (!people) {
    // create a new people
    const newPeople = await People.create(body);
    return res.json(newPeople);
  }

  // update the people
  Object.keys(body).forEach(val => {
    people[val] = body[val];
  });

  const newPeople = await people.save();
  res.json(newPeople);
});

router.put('/:id', async (req, res) => {
  const people = await People.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  return res.json(people);
});

router.delete('/:id', async (req, res) => {
  const people = await People.findByIdAndDelete(req.params.id);
  return res.json(people);
});

module.exports = router;

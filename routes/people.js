const express = require('express');
const _ = require('lodash');
const People = require('../models/people');
const removeRequestBodyWithNull = require('../utils/removeRequestBodyWithNull');

const router = express.Router();

router.get('/', async (req, res, next) => {
  const results = await People.find();
  res.json(results);
});

router.post('/', 
  async(req, res) => {
    const body = removeRequestBodyWithNull(req.body);
    if (typeof body.messengerUserId === 'undefined') {
      return res.status(400).json({
        message: 'invalid messenger user id'
      });
    }

    const people = await People.findOne({ messengerUserId: body.messengerUserId });
    if (!people) {
      // create a new people
      const newPeople = await People.create(body);
      return res.json(newPeople);  
    }
  
    // update the people
    Object.keys(body).forEach((val) => {
      if (!_.isEmpty(val) && !_.isEmpty(body[val]) && body[val] !== 'null') {
        people[val] = body[val];
      }
    });
    
    const newPeople = await people.save();
    res.json(newPeople);
  }
);

module.exports = router;

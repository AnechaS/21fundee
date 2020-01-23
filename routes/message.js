const express = require('express');
const Message = require('../models/message');
const router = express.Router();

router.get('/', async (req, res) => {
  const schedule = await Message.find();
  return res.json(schedule);
});

router.post('/', async (req, res) => {
  // const schedule = await Schedule.create(req.body);
  // return res.json(schedule);
});

router.put('/:id', async(req, res) => {
  // const schedule = await Schedule.findByIdAndUpdate(
  //   req.params.id, 
  //   { $set: req.body }, 
  //   { 'new': true }
  // );
  // return res.json(schedule);
});

router.delete('/:id', async(req, res) => {
  // const schedule = await Schedule.findByIdAndDelete(req.params.id);
  // return res.json(schedule);
});

module.exports = router;
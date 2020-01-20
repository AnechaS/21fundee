const express = require('express');
const _ = require('lodash');
const { body } = require('express-validator');
const { handleValidator } = require('../middlewares');
const People = require('../models/people');
const router = express.Router();

router.get('/', async (req, res, next) => {
  const results = await People.find();
  res.json(results);
});

router.post('/', 
  handleValidator([
    body('messengerUserId').isLength({ min: 1 }),
  ]),
  async(req, res) => {
    const people = await People.findOne({ messengerUserId: req.body.messengerUserId });
    if (!people) {
      // create a new people
      const newPeople = await People.create(req.body);
      return res.json(newPeople);  
    }

    // update the people
    Object.keys(req.body).forEach((val) => {
      if (!_.isEmpty(val) && !_.isEmpty(req.body[val])) {
        people[val] = req.body[val];
      }
    });
    
    const newPeople = await people.save();
    res.json(newPeople);
  }
);

// /**
//  * Recevice Bot Conversation province
//  */
// router.post('/province',   
//   handleValidator([
//     body('user_id').isLength({ min: 1 }),
//     body('first_name').isLength({ min: 1 }),
//     body('last_name').isLength({ min: 1 }),
//     body('last_user_freeform_input').isLength({ min: 1 }),
//   ]), async (req, res) => {
//     const { 
//       user_id, 
//       first_name, 
//       last_name, 
//       last_user_freeform_input 
//     } = req.body;
    
//     let user;
    
//     user = await User.findOne({ userId: user_id });
//     if (user) {
//       // Update user
//       user.userId = user_id;
//       user.firstName = first_name;
//       user.lastName = last_name;
//       user.province = last_user_freeform_input;
//       user = await user.save();
//     } else {
//       // New user
//       user = await User.create({
//         userId: user_id,
//         firstName: first_name,
//         lastName: last_name,
//         province: last_user_freeform_input
//       });
//     }

//     res.json(user);
//   }
// );

// /**
//  * Recevice Bot Conversation district
//  */
// router.post('/district',  
//   handleValidator([
//     body('user_id').isLength({ min: 1 }),
//     body('first_name').isLength({ min: 1 }),
//     body('last_name').isLength({ min: 1 }),
//     body('last_user_freeform_input').isLength({ min: 1 }),
//   ]), async (req, res) => {
//     console.log('/district', req.body);

//     const { 
//       user_id, 
//       first_name, 
//       last_name, 
//       last_user_freeform_input 
//     } = req.body;
    
//     let user;
    
//     user = await User.findOne({ userId: user_id });
//     if (user) {
//       // Update user
//       user.userId = user_id;
//       user.firstName = first_name;
//       user.lastName = last_name;
//       user.district = last_user_freeform_input;
//       user = await user.save();
//     } else {
//       // New user
//       user = await User.create({
//         userId: user_id,
//         firstName: first_name,
//         lastName: last_name,
//         district: last_user_freeform_input
//       });
//     }

//     res.json(user);
//   }
// );

// router.post('/child',   
//   handleValidator([
//     body('user_id').isLength({ min: 1 }),
//     body('first_name').isLength({ min: 1 }),
//     body('last_name').isLength({ min: 1 }),
//     body('last_user_freeform_input').isLength({ min: 1 }),
//     body('dental_personnel_id').isLength({ min: 1 }),
//     body('child_name').isLength({ min: 1 }),
//   ]), async (req, res) => {
//     console.log('/child', req.body);
    
//     const { 
//       user_id, 
//       first_name, 
//       last_name,
//       last_user_freeform_input,
//       dental_personnel_id,
//       child_name
//     } = req.body;
    
//     let user;
    
//     user = await User.findOne({ userId: user_id });
//     if (user) {
//       // Update user
//       user.userId = user_id;
//       user.firstName = first_name;
//       user.lastName = last_name;
//       user.dentalPersonnelId = dental_personnel_id;
//       user.childName = child_name;
//       user.childBirthday = last_user_freeform_input;
//       user = await user.save();
//     } else {
//       // New user
//       user = await User.create({
//         userId: user_id,
//         firstName: first_name,
//         lastName: last_name,
//         dentalPersonnelId: dental_personnel_id,
//         childName: child_name,
//         childBirthday: last_user_freeform_input
//       });
//     }

//     res.json(user);
//   }
// );

module.exports = router;

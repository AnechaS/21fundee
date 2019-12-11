const express = require('express');
const { body } = require('express-validator');
const { handleValidator } = require('../middlewares');
const User = require('../models/user');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.json({});
});

// router.post('/', (req, res, next) => {
//   res.json({});
// });

/**
 * Recevice Bot Conversation province
 */
router.post('/province',   
  handleValidator([
    body('user_id').isLength({ min: 1 }),
    body('first_name').isLength({ min: 1 }),
    body('last_name').isLength({ min: 1 }),
    body('last_clicked_button_name').isLength({ min: 1 }),
  ]), async (req, res) => {
    const { 
      user_id, 
      first_name, 
      last_name, 
      last_clicked_button_name 
    } = req.body;
    
    let user;
    
    user = await User.findOne({ userId: user_id });
    if (user) {
      // Update user
      user.userId = user_id;
      user.firstName = first_name;
      user.lastName = last_name;
      user.province = last_clicked_button_name;
      user = await user.save();
    } else {
      // New user
      user = await User.create({
        userId: user_id,
        firstName: first_name,
        lastName: last_name,
        province: last_clicked_button_name
      });
    }

    res.json(user);
  }
);

/**
 * Recevice Bot Conversation district
 */
router.post('/district',  
  handleValidator([
    body('user_id').isLength({ min: 1 }),
    body('first_name').isLength({ min: 1 }),
    body('last_name').isLength({ min: 1 }),
    body('last_clicked_button_name').isLength({ min: 1 }),
  ]), async (req, res) => {
    const { 
      user_id, 
      first_name, 
      last_name, 
      last_clicked_button_name 
    } = req.body;
    
    let user;
    
    user = await User.findOne({ userId: user_id });
    if (user) {
      // Update user
      user.userId = user_id;
      user.firstName = first_name;
      user.lastName = last_name;
      user.district = last_clicked_button_name;
      user = await user.save();
    } else {
      // New user
      user = await User.create({
        userId: user_id,
        firstName: first_name,
        lastName: last_name,
        district: last_clicked_button_name
      });
    }

    res.json(user);
  }
);

router.post('/child',   
  handleValidator([
    body('user_id').isLength({ min: 1 }),
    body('first_name').isLength({ min: 1 }),
    body('last_name').isLength({ min: 1 }),
  ]), async (req, res) => {
    console.log(res.body);
    
    res.json({});
  }
);

module.exports = router;

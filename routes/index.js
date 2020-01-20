const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  console.log('xx');
  
  res.json({ message: 'wellcome' });
});

module.exports = router;

const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.redirect('https://21fundee.com');
});

module.exports = router;

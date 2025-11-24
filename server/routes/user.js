const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.put('/:id/change-password', userController.changePassword);

module.exports = router;

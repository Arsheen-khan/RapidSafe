const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');

const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post(
  '/create',
  authMiddleware.authUser,

  body('pickup.address')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Invalid pickup address'),

  body('pickup.lat')
    .isNumeric()
    .withMessage('Invalid latitude'),

  body('pickup.lng')
    .isNumeric()
    .withMessage('Invalid longitude'),

  body('destination.lat')
    .isNumeric()
    .withMessage('Invalid destination latitude'),

  body('destination.lng')
    .isNumeric()
    .withMessage('Invalid destination longitude'),

  body('vehicleType')
    .isString()
    .isIn(['ambulance', 'auto', 'car', 'moto'])
    .withMessage('Invalid vehicle type'),

  rideController.createRide
);

router.get(
  '/get-fare',
  authMiddleware.authUser,

  query('pickup')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Invalid pickup address'),

  query('destination')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Invalid destination address'),

  rideController.getFare
);

router.post(
  '/confirm',
  authMiddleware.authCaptain,

  body('rideId')
    .isMongoId()
    .withMessage('Invalid ride id'),

  rideController.confirmRide
);

router.get(
  '/start-ride',
  authMiddleware.authCaptain,

  query('rideId')
    .isMongoId()
    .withMessage('Invalid ride id'),

  query('otp')
    .isString()
    .isLength({ min: 6, max: 6 })
    .withMessage('Invalid OTP'),

  rideController.startRide
);

router.post(
  '/end-ride',
  authMiddleware.authUser,

  body('rideId')
    .isMongoId()
    .withMessage('Invalid ride id'),

  rideController.endRide
);

router.get(
  '/get-ride',

  authMiddleware.authUser,

  query('rideId')
    .isMongoId()
    .withMessage('Invalid ride id'),

  rideController.getRide
);

module.exports = router;
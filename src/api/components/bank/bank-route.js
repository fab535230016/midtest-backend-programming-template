const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const banksControllers = require('./bank-controller');
const banksValidator = require('./bank-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/banks', route);

  // Get list of banks
  route.get('/', banksControllers.getBanks);

  // Create bank
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(banksValidator.createBank),
    banksControllers.createBank
  );

  // Get bank detail
  route.get('/:id', authenticationMiddleware, banksControllers.getBank);

  // Update bank
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(banksValidator.updateBank),
    banksControllers.updateBank
  );

  // Delete bank
  route.delete('/:id', authenticationMiddleware, banksControllers.deleteBank);

  // Change password
  route.post(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(banksValidator.changePassword),
    banksControllers.changePassword
  );
};

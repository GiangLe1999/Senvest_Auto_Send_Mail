const express = require('express');
const { getEmailReport } = require('../controllers/report.controller');
const reportRouter = express.Router();

reportRouter.get('/new-report', getEmailReport);

module.exports = reportRouter;
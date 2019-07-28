import {Application} from 'express';
import {authenticate, withdraw, balance} from './request-handlers';

const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');

const app: Application = express();
app.use(bodyParser.json());
app.use(cors());
app.route('/api/pin').post(authenticate);
app.route('/api/withdraw').post(withdraw);
app.route('/api/balance').get(balance);

const port = process.env.PORT || 9999;

app.listen(port, () => {
    console.log('Mock PIN API running at http://localhost:' + port);
});



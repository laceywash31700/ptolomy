'use strict';
require('dotenv').config();
const {startUp} = require('./server');
const Port = process.env.PORT || 3002

startUp(Port);

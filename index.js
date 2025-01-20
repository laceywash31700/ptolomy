'use strict';
require('dotenv').config();
const {startUp} = require('./src/server.js');
const Port = process.env.PORT || 3002

startUp(Port);

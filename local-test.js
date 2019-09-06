"use strict";

const express = require('express'),
      bodyParser = require('body-parser'),
      app = express(),
      mod = require('./index');

app.use(bodyParser.json());

app.get('/', mod.pdf);
app.post('/', mod.pdf);

console.log('listening to 3000');
app.listen(3000);

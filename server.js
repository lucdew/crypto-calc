const express = require('express');
const path = require('path');


app = express(),
port = process.env.PORT || 3000;


app.use(express.static(path.join(__dirname,'build','app')));
app.listen(port);
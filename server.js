var express = require('express'),
app = express(),
port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.sendFile(__dirname+'/index-web.html');
});
app.use(express.static(__dirname));
app.listen(port);
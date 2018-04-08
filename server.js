const express = require('express');
const path = require('path');
const app = express();
const dotenv = require('dotenv');

dotenv.load();

app.use('/app',express.static(path.join(__dirname,'app')));
app.use('/partials',express.static(path.join(__dirname,'partials')));
app.use('/node_modules',express.static(path.join(__dirname,'node_modules')));
app.use('/static',express.static(path.join(__dirname,'static')));
app.use('/json',express.static(path.join(__dirname,'json')));
app.get('/',function(req,res){
  res.sendFile(path.join( __dirname, 'index.html'));
});
app.listen(process.env.PORT_ADDRESS, function(){
  console.log("The http://127.0.0.1:/" +process.env.PORT_ADDRESS +" is listening");
});

//import * as express from 'express';
//import * as path from 'path';
const express=require('express');
const path=require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname,'..','build','test')));
app.use('/node_modules', express.static(path.join(__dirname,'..','node_modules')));
app.use('/crypto-lib', express.static(path.join(__dirname,'..','crypto-lib')));
app.listen(port);
console.log(__dirname);

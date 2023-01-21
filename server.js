
/******************************************************************
 *File Name : server.js
 *Author : Sudhakar Jha
 *Project Name : sendtune-be
 *Date : Tuesday, Jan 21th, 2023
 *Description : Server File
 *Copyrights : All rights reserved by sendtune.in
 *******************************************************************/
 const express = require('express');
 const createError = require('http-errors');
 const morgan = require('morgan');
 require('dotenv').config();
 const db = require('./db/index');
 const indexRouter  = require('./routes/index');
 const requestValidator = require('./util/request-validator');
 const responseHandler = require('./util/response-handler')
 const cors = require('cors')
 const app = express();
 const port = 3011;
 
 app.use(cors());
 
 // const whitelist = ['http://developer1.com', 'http://developer2.com']
 // const corsOptions = {
 //   origin: (origin, callback) => {
 //     if (whitelist.indexOf(origin) !== -1) {
 //       callback(null, true)
 //     } else {
 //       callback(new Error())
 //     }
 //   }
 // }
 
 app.use(express.json());
 app.use(express.urlencoded({ extended: false }));
 app.use(morgan('dev'));
 // require('./db/connection')
 
 app.get('/', async (req, res, next) => {
   res.send({ message: 'Awesome it works 🐻' });
 });
 
//  function set() {
//    db.query('insert into test (name) values ($1)', ["s"], (e, d) => {
//      // console.log("DB", e, d)
//    })
//  }
//  set()
 
 app.use(requestValidator);
 // app.enable("trust proxy");
 app.use(responseHandler);
 app.use('/tune/v1.0.0', indexRouter);
 
 app.use((req, res, next) => {
   next(createError.NotFound());
 });
 
 app.use((err, req, res, next) => {
   res.status(err.status || 500);
   res.send({
     status: err.status || 500,
     message: err.message,
   });
 });
 

app.listen(port, () => {
    console.log("server is started at port: ".bold.brightYellow+ `${port}`.brightYellow)
})

//Script is written and developed by Sudhakar Jha
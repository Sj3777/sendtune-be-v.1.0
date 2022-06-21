const express = require('express');
const colors = require('colors');
const bodyparser=require('body-parser');
// const cookieParser=require('cookie-parser');
const cors = require('cors')
const app = express();
// const route = require('./router/route')
const port = process.env.PORT || 2903;
// require("./config/db")
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cors()) 
// app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
// app.use("/api/product", route);


app.listen(port, () => {
    console.log("server is started at port: ".bold.brightYellow+ `${port}`.brightYellow)
})

//Script is written and developed by Sudhakar Jha
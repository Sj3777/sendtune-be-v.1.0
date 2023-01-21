/******************************************************************
 *File Name : user.route.js
 *Author : Sudhakar Jha
 *Project Name : sendtune-be
 *Date : Tuesday, Jan 21th, 2023
 *Description : user routing File
 *Copyrights : All rights reserved by sendtune.in
 *******************************************************************/

const express = require("express");
const controller = require("../controllers/user/user.controller");
const TokenHandler= require('../middlewares/jwt.middleware')
let adminRouter = express.Router();

adminRouter.post("/login", controller.login);
adminRouter.post("/logOut", TokenHandler.verifyToken, controller.logOut);
adminRouter.post("/addUser",  controller.addUser);
// adminRouter.get("/getAllUsers/:limit/:offset",TokenHandler.verifyToken, controller.getAllUsers);
// adminRouter.get("/getUserByEmail", TokenHandler.verifyToken,controller.getUserByEmail);

// adminRouter.post("/project", controller.addProject);

module.exports = adminRouter;


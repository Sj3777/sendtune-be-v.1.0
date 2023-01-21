/******************************************************************
 *File Name : user.controller.js
 *Author : Sudhakar Jha
 *Project Name : sendtune
 *Date : Tuesday, Jan 21th, 2023
 *Description : Admin Auth Conytroller
 *Copyrights : All rights reserved by sendtune.in
 *******************************************************************/
const db = require("../../db");
const async = require("async");
//  const { v4: uuidv4 } = require("uuid");
const UserModel = require("../../models/user.model");
// const UserModel = require("../../models/user.model");
const UserProperty = require("./user.property");
const TokenHandler = require('../../middlewares/jwt.middleware');
// import * as bcrypt from 'bcrypt';
const bcrypt = require("bcrypt");
const { param } = require("../../routes");
/**
 * @date : Tuesday, Jan 17th, 2023
 * @author Sudhakar Jha
 * @function login
 * @param {Request} req
 * @param {Response} res
 * @description API to Login
 * @method POST
 */
exports.login = (req, res) => {
  if (
    req.validate([
      {
        field: "email",
        type: "string",
        isRequired: true,
      },
      {
        field: "password",
        type: "string",
        isRequired: true,
      },
    ])
  ) {
    async.waterfall(
      [
        function (next) {
          const { email, password } = req.reqBody;
          console.log("reqqqq:::::::::::::::;", req.reqBody)
          UserProperty.validateUserWithEmailPassword(email, password)
            .then((userInfo) => {
              if (!userInfo.error) {
                next(null, userInfo);
              } else {
                next("ERR010");
              }
            })
            .catch((err) => {
              next(err);
            });
        },
        function (user, next) {
          TokenHandler.generateToken(user.EmployeId).then((token) => {
            token.email = user.data.email;
            token.employeId = user.data.employeId;
            next(null, token, user);
          });
        },
        (token, user, next) => {
          UserModel.update(
            {
              token: token.data,
            },
            {
              where: {
                employeId: token.employeId,
              },
            }
          )
            .then((adminToken) => {
              const userData = {
                token: token?.data,
                user: user?.data?.email,
              };
              next(null, userData);
            })
            .catch((err) => {
              next(err);
            });
        },
      ],
      function (err, userData) {
        if (err) {
          res.sendError(err);
        } else {
          res.sendData(userData, "Logged in successfully!");
        }
      }
    );
  } else {
    res.sendError();
  }
};

exports.logOut = (req, res) => {
  if (
    req.validate([
      {
        field: "email",
        type: "string",
        isRequired: true,
      },
    ])
  ) {
    async.waterfall(
      [
        function (next) {
          const { email } = req.reqBody;
          UserProperty.getAdminByEmail(email)
            .then((userInfo) => {
            
              console.log("userInfouserInfo", userInfo.data)
              if (userInfo.error) {
                next(null, userInfo);
              }
              UserModel.update(
                {
                  token: null,
                },
                {
                  where: {
                    email: userInfo.data.email,
                  },
                }
              )
                .then((data) => {
                  
                  next(null, data);
                  console.log(data,'data from mjy s');
                })
                .catch((err) => {
                  next(err);
                });
            })
            .catch((err) => {
              next(err);
            });
        },
      ],
      function (err) {
        if (err) {
          res.sendError(err);
        } else {
          res.sendData({},"log Out successfully!");
        }
      }
    );
  } else {
    res.sendError();
  }
};

exports.addUser = (req, res) => {
  if (
    req.validate([
      {
        field: "username",
        type: "string",
        isRequired: true,
      },
      // {
      //   field: "password",
      //   type: "text",
      //   isRequired: true,
      // },
      {
        field: "empId",
        type: "string",
        isRequired: true,
      },
      {
        field: "name",
        type: "string",
        isRequired: true,
      },
      {
        field: "email",
        type: "string",
        isRequired: true,
      },
      // {
      //   field: "projects",
      //   type: "string",
      //   isRequired: true,
      // },
      {
        field: "designation",
        type: "string",
        isRequired: true,
      },
      {
        field: "TL",
        type: "string",
        isRequired: true,
      },
      {
        field: "role",
        type: "string",
      },
      {
        field: "isActive",
        type: "boolean",
      }

    ])
  ) {
    async.waterfall(
      [
        function (next) {
          const password = 'admin@123';
          const { username, empId, name, email, projects, designation, TL, role, isActive } = req.reqBody;
          UserProperty.getUserByEmpid(empId).then((userInfo)=>{
            console.log(userInfo,'userInfo');
            if (userInfo.data !== null) {
              res.sendError("ERR106")
            }else{
          UserProperty.getUserByEmail(email)
            .then((userInfo) => {
              console.log("userInfouserInfouserInfouserInfouserInfo", userInfo)
              if (userInfo.data !== null) {
                // res.sendError({ massage: "Email already exits", status: 400, error: true });
                res.sendError("ERR005")
              } else {
                const salt = bcrypt.genSaltSync(10);
                const newPassword = bcrypt.hashSync(password, salt);
                UserModel.create({
                  username: username,
                  password: newPassword,
                  empId: empId,
                  name: name,
                  email: email,
                  projects: projects,
                  designation: designation,
                  TL: TL,
                  role: role,
                  isActive: isActive
                }).then((data) => {
                  res.sendData(data, "User created successfully!")
                }).catch((err) => {
                  next(err)
                })
                  .catch((err) => {
                    next(err);
                  });
              }
              
              
            })
          }
        })
            .catch((err) => {
              next(err);
            });
        },
      ]);
  } else {
    res.sendError();
  }
};



exports.getAllUsers = (req, res) => {
  {
    async.waterfall(
      [

        function (next) {
          const limit = Number(req.params.limit) || 10;
          let offset = Number(req.params.offset) || 1;

          if (limit > -1) {
            if (offset < 1) {
              offset = 1;
            }
            offset = (offset - 1) * limit;
          }
          UserProperty.getAllUser({ limit, offset })
            .then((data) => {
              res.sendData(data)
            })
            .catch((err) => {
              next(err);
            });
        },
      ],
    );
  }
};

exports.getUserByEmail = (req, res) => {
  {
    async.waterfall([
      function (next) {
        const { email } = req.reqBody;
        UserProperty.getUserByEmail(email)
          .then((data) => {
            res.sendData(data);
          })
          .catch((err) => {
            next(err);
          });
      },
    ]);
  }
};

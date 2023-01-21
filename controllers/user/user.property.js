/******************************************************************
 *File Name : app.js
 *Author : Sudhakar Jha
 *Project Name : projman
 *Date : Tuesday, Jan 17th, 2023
 *Description : Server File
 *Copyrights : All rights reserved by antiersolutions.com
 *******************************************************************/

const UserModel = require("../../models/user.model");
const bcrypt = require("bcrypt");
const sequelize = require('../../db/connection');
const { QueryTypes } = require('sequelize');

exports.validateUserWithEmailPassword = async (email, password) => {
  try {
    const adminInfo = await UserModel.findOne({
      where: {
        email,
      },
      raw: true,
    });

    if (!adminInfo || !adminInfo) {
      throw { message: "User not found" };
    }

    // Validating password
    const validPassword = await bcrypt.compare(password, adminInfo.password);

    if (!validPassword)
      throw {
        message: "Wrong password",
      };

    return {
      message: "User found success",
      data: adminInfo,
      error: false,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      error: true,
      status: err.status ? err.status : 400,
    };
  }
};


exports.getAdminByEmail = async (email) => {
  try {
    const adminInfo = await UserModel.findOne({
      where: {
        email,
      },
      raw: true,
    });
    console.log("adminInfoadminInfo", adminInfo)
    return {
      message: "Admin found success",
      data: adminInfo,
      error: false,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      error: true,
      status: err.status ? err.status : 400,
    };
  }
};




exports.getAllUser = async ({ limit, offset }) => {
  try {
    // console.log("limitlimit",limit,"offsetoffset",offset)
    const userInfo = await sequelize.query(
      'SELECT employeId, username, empId, name, email, projects, designation, TL, role, isActive FROM `employe` ORDER BY createdAt DESC  LIMIT :offset, :limit',
      {
        replacements: { offset: offset, limit: limit },
        type: QueryTypes.SELECT,

      },

    );
    const count = await sequelize.query(
      `SELECT COUNT(e1.employeId ) as count FROM employe as e1 `,
      {
        type: QueryTypes.SELECT,
      }

    );
    // console.log("countcountcount",count)
    // console.log("userInfoUserInfo", userInfo)
    return {
      message: "User found success",
      data: userInfo,
      total_Count: count[0].count,
      error: false,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      error: true,
      status: err.status ? err.status : 400,
    };
  }
};


exports.getUserByEmail = async (email) => {
  try {
    const userInfo = await UserModel.findOne({
      where: {
        email,
      },
      attributes: [
        'employeId',
        'username',
        'empId',
        'name',
        'email',
        'projects',
        'designation',
        'TL',
        'role',
        'isActive'
      ],
      raw: true,
    });
    console.log("userInfoUserInfo", userInfo)
    return {
      message: "User found success",
      data: userInfo,
      error: false,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      error: true,
      status: err.status ? err.status : 400,
    };
  }
};
exports.getUserByEmpid = async (empId) => {
  try {
    const userInfo = await UserModel.findOne({
      where: {
        empId,
      },
      attributes: [
        'employeId',
        'username',
        'empId',
        'name',
        'email',
        'projects',
        'designation',
        'TL',
        'role',
        'isActive'
      ],
      raw: true,
    });
    console.log("userInfoUserInfo", userInfo)
    return {
      message: "User found success",
      data: userInfo,
      error: false,
      status: 200,
    };
  } catch (err) {
    return {
      message: err.message,
      error: true,
      status: err.status ? err.status : 400,
    };
  }
};





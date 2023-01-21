// https://sequelize.org/master/manual/model-basics.html
const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

UserModel = sequelize.define(
  "user",
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1,
    },
  },
  {
    tableName: "user",
  }
);
// This checks what is the current state of the table in the database (which columns it has, what are their data types, etc), and then performs the necessary changes in the table to make it match the model.
// AdminUsersModel.sync({ alter: true });

module.exports = UserModel;



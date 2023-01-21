// import '../../common/env';
const  CONFIG  = require("../util/config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  CONFIG.MYSQLDB.DATABASE_NAME,
  CONFIG.MYSQLDB.USERNAME,
  CONFIG.MYSQLDB.PASSWORD,
  {
    host: CONFIG.MYSQLDB.HOST,
    dialect: "mysql",
    logging: CONFIG.NODE_ENV === "development" ? true : false,
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
      max: 5,
    },
    pool: {
      max: 100,
      min: 2,
      acquire: 1000000,
      idle: 200000,
    },
  }
);
// Sync all models on application startup, during `development` environment
const runDB = () => {
  try {
    if (CONFIG.NODE_ENV === "development") {
      sequelize
        .sync({ alter: true })
        .then(() => {
          console.log("All Models synced succesfully:");
        })
        .catch((error) => {
          throw error;
        });
    }
    sequelize.authenticate();
  } catch (error) {
    console.log("Error syncing db models: ", error);
  }
};
runDB();

module.exports = sequelize;

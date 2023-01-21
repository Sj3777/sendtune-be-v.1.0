/*
@author DB
@class response-handler
@desc ExpressJS middleware for response request handler for RESt API
*/
module.exports = function (req, res, next) {
  req.client_ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  req.reqBody = req.body.reqData || {};
  req.reqHeaders = req.body.header || {};
  req.authorization_token = req.headers.authorization
    ? req.headers.authorization.split(" ").pop()
    : undefined;
  res.filterByPermission = function (resource, obj, mode) {
    for (var key in obj) {
      if (typeof obj[key] !== "object") {
        if (
          req.access_permissions[resource][key] &&
          !req.access_permissions[resource][key][mode]
        ) {
          obj[key] = undefined;
        }
      }
    }
  };
  if (req.reqHeaders && req.reqHeaders.deviceInfo) {
    req.reqHeaders.deviceInfo.ip =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  }
  res.sendData = function (data, msg) {
    var resData = {
      // "header": header || this.req.body.header || {},
      status: 200,
      message: msg,
      responseData: data,
      errors: false,
    };
    res.status(200).send(resData);
  };
  res.errors = [];
  res.errorList = require("./error-list.json");
  res.getErrorObj = function (code, field, customMessage, vals) {
    var error = {
      code: code || "ERR000",
      message: customMessage || "Unknown error",
      field: field || "common",
    };
    if (!customMessage && this.errorList[code]) {
      error.message =
        (error.code == "ERR001" ? error.field + " " : "") +
        this.errorList[code];
    }
    if (vals) {
      for (var key in vals) {
        if (typeof vals[key] != undefined) {
          error.message = error.message.replace(
            new RegExp("{" + key + "}", "g"),
            vals[key]
          );
        }
      }
    }
    return error;
  };
  res.addErrorByCode = function (code, field, customMessage, vals) {
    res.errors.push(this.getErrorObj(code, field, customMessage, vals));
  };
  res.addErrorByObj = function (err) {
    res.errors.push(
      this.getErrorObj(
        err ? err.code : "",
        null,
        err ? err.errmsg || err.message : "",
        err.params
      )
    );
  };
  res.addError = function (code, field, customMessage, vals) {
    res.errors.push(this.getErrorObj(code, field, customMessage, vals));
  };
  res.sendErrorMessage = function (err, field, message, vals, statusCode) {
    if (typeof err == "string") {
      res.addErrorByCode(err, field, message, vals);
    } else if (err) {
      res.addErrorByObj(err, field, message, vals);
    }
    res.status(statusCode || 200).send(res.errors[0].message);
  };
  res.sendDataAsFile = function (
    data,
    type = "text/plain",
    filename = "download"
  ) {
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", type);
    res.charset = "UTF-8";
    res.write(data);
    res.end();
  };
  res.sendError = function (err, field, message, vals) {
    if (typeof err == "string") {
      res.addErrorByCode(err, field, message, vals);
    } else if (err) {
      res.addErrorByObj(err, field, message, vals);
    }
    var resData = {
      // header: this.req.body.header,
      status: 400,
      error: true,
      message: res.errors[0].message,
      errors: res.errors,
    };
    const invalidToken = ["ERR007", "ERR008", "ERR009", "ERR066"];
    let statusCode = 400;
    if (res.errors && res.errors.length) {
      let isPresent = res.errors.filter((error) => {
        if (invalidToken.includes(error.code)) {
          return error;
        }
      });
      if (isPresent && isPresent.length) {
        statusCode = 401;
      }
    }
    res.status(statusCode).send(resData);
  };
  res.sendMessage = function (msgCode) {
    var msg = res.errorList[msgCode] || "Define message";
    var resData = {
      header: this.req.body.header || {},
      result: {
        status: true,
        message: "success",
      },
      responseData: { message: msg },
      errors: null,
    };
    res.status(200).send(resData);
  };
  next();

  // res.sendError = function (data, msg) {
  //   var resData = {
  //     // "header": header || this.req.body.header || {},
  //     status: data.status,
  //     message: msg,
  //     responseData: data,
  //     errors: true,
  //   };
  //   res.status(400).send(resData);
  // };
};

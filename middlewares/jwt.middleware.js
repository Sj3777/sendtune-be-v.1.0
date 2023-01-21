const jwt = require("jsonwebtoken");
const CONFIG = require("../util/config");
const RESPONSES = require("../constant/response");
// import SetResponse from "../response/response.helper";
const MESSAGES = require("../constant/response.messages");

class TokenHandler {
  generateToken = async (userId) => {
    try {
      if (!CONFIG.JWT.ACCESS_SECRET) {
        throw { message: MESSAGES.JWT.SECRET_ERROR };
      }

      const payload = {
        // aud: userId
      };
      const secret = CONFIG.JWT.ACCESS_SECRET;
      const options = {
        expiresIn: CONFIG.JWT.EXPIRES_IN,
        // issuer: CONFIG.JWT.ISSUER,
        // audience: userId,
      };

      const token = jwt.sign(payload, secret, options);
      if (!token)
        throw {
          message: MESSAGES.JWT.GENERATE_ERROR,
          status: RESPONSES.INTERNALSERVER,
        };

      return {
        data: token,
        error: false,
        message: MESSAGES.JWT.SUCCESS,
        status: RESPONSES.SUCCESS,
      };
    } catch (error) {
      return {
        error: true,
        status: error.status ? error.status : RESPONSES.BADREQUEST,
        message: error.message,
      };
    }
  };
  // verifyTokenUser = (req, res) => {
  //   const token = req.header("Authorization");
  //   if (!token)
  //     return sendError(res, RESPONSES.UN_AUTHORIZED, {
  //       message: MESSAGES.JWT.ERROR,
  //       error: true,
  //     });
  //   try {
  //     if (!CONFIG.JWT.ACCESS_SECRET) {
  //       throw { message: MESSAGES.JWT.SECRET_ERROR };
  //     }

  //     const { aud } = jwt.verify(token, CONFIG.JWT.ACCESS_SECRET);
  //     req.userId = aud;
  //     return SetResponse.success(res, RESPONSES.SUCCESS, {
  //       message: "Token verified Success",
  //       error: false,
  //       status: true,
  //     });
  //     //return next();
  //   } catch (error) {
  //     // L.error(error, "JWT Helper - Error while verifying token user");

  //     return SetResponse.success(res, 401, {
  //       message: "Token verified Failed",
  //       error: true,
  //       status: false,
  //     });
  //   }
  // };
  verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    // console.log(token,"token")
    if (!token)
      throw {
        message: MESSAGES.JWT.ERROR,
        status: RESPONSES.UN_AUTHORIZED,
      };
    try {
      if (!CONFIG.JWT.ACCESS_SECRET) {
        throw { message: MESSAGES.JWT.SECRET_ERROR };
      }
      const { aud } = jwt.verify(token, CONFIG.JWT.ACCESS_SECRET);
      req.userId = aud;
      return next();
    } catch (error) {
      // L.error(error, "JWT Helper - Error while verifying verify token");
      throw {
        message: MESSAGES.JWT.EXPIRED,
        status: RESPONSES.UN_AUTHORIZED,
      };
    }
  };
  // generateRefreshToken = async (userId) => {
  //   try {
  //     if (!CONFIG.JWT.REFRESH_TOKEN) {
  //       throw { message: MESSAGES.JWT.SECRET_ERROR };
  //     }
  //     const payload = {
  //       // aud: userId
  //     };
  //     const secret = CONFIG.JWT.REFRESH_TOKEN;
  //     const options = {
  //       expiresIn: "1m", // One month expiry
  //       issuer: CONFIG.JWT.ISSUER,
  //       audience: userId,
  //     };
  //     const token = jwt.sign(payload, secret, options);
  //     // L.info("JWT Helper - Generating RefreshToken");

  //     if (!token)
  //       throw {
  //         message: MESSAGES.JWT.GENERATE_ERROR,
  //         status: RESPONSES.INTERNALSERVER,
  //       };
  //     return {
  //       data: token,
  //       error: false,
  //       message: MESSAGES.JWT.SUCCESS,
  //       status: RESPONSES.SUCCESS,
  //     };
  //   } catch (error) {
  //     // L.error(error, "JWT Helper - Error while generation refresh token");

  //     return {
  //       error: true,
  //       status: error.status ? error.status : RESPONSES.BADREQUEST,
  //       message: error.message,
  //     };
  //   }
  // };
  // verifyRefreshToken = async (refreshToken) => {
  //   try {
  //     if (!CONFIG.JWT.REFRESH_TOKEN) {
  //       throw { message: MESSAGES.JWT.SECRET_ERROR };
  //     }

  //     if (!refreshToken)
  //       throw {
  //         message: MESSAGES.JWT.ERROR,
  //         status: RESPONSES.UN_AUTHORIZED,
  //       };

  //     const { aud } = jwt.verify(refreshToken, CONFIG.JWT.REFRESH_TOKEN);
  //     return {
  //       data: aud,
  //       error: false,
  //       message: MESSAGES.JWT.SUCCESS,
  //       status: RESPONSES.SUCCESS,
  //     };
  //   } catch (error) {
  //     // L.error(error, "JWT Helper - Error while verifying refresh token");

  //     return {
  //       error: true,
  //       status: error.status ? error.status : RESPONSES.UN_AUTHORIZED,
  //       message: error.message,
  //     };
  //   }
  // };

  /**
   * Lambda Authorizer function parse jwttoken, if valid, extract the userId and pass
   * to this function in headers
   * @param req
   * @param res
   * @param next
   * @returns
   */

  // lambdaAuthorizer = (req: Request, res: Response, next: NextFunction) => {
  //   const userId = req.header('userid');
  //   const userRole = req.header('role');
  //   if (!userId)
  //     return SetResponse.error(res, RESPONSES.UN_AUTHORIZED, {
  //       message: MESSAGES.JWT.ERROR,
  //       error: true,
  //     });
  //   req.userId = userId;
  //   req.userRole = userRole;
  //   return next();
  // };
}
module.exports = new TokenHandler();
// export default new TokenHandler();

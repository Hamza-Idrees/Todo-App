require("dotenv").config();
const { verifyToken } = require("../helper/helperFunction");
const { statusCode, message } = require("../constants/statusCodes");

SECRET_KEY = process.env.SECRET_KEY;

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(statusCode.FORBIDDEN).json({
      error: "Token is missing. Access Denied",
      message: message.UNAUTHORIZED,
    });
  }

  const decoded = verifyToken(token, SECRET_KEY);
  console.log(decoded);

  if (decoded.error) {
    // If the error is related to token expiration or invalidity
    return res.status(statusCode.UNAUTHORIZED).json({ error: decoded.error });
  }

  req.user = decoded;
  next();
};
module.exports = authenticate;

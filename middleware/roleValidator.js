require("dotenv").config();
const { statusCode, message } = require("../constants/statusCodes");

SECRET_KEY = process.env.SECRET_KEY;

const roleAdmin = (req, res, next) => {
  const role = req.user.role;
  if (role !== "admin") {
    return res.status(statusCode.FORBIDDEN).send({
      error: message.FORBIDDEN,
      message: "Access Denied. Only admin can update status",
    });
  }
  next();
};

module.exports = roleAdmin;

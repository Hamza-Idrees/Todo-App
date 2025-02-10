const User = require("../model/userSchema");
const { statusCode, message } = require("../constants/statusCodes");
const {
  generateHashPassword,
  comparePassword,
  generateToken,
} = require("../helper/helperFunction");
const {
  saveDataInCache,
  getDataFromCache,
} = require("../helper/redisFunction");
require("dotenv").config();

SECRET_KEY = process.env.SECRET_KEY;
TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION;

exports.createUser = async (req, res) => {
  try {
    const { username, pass, role, email } = req.body;
    const image = req.files;

    if (!username || typeof username !== "string")
      return res.status(statusCode.BAD_REQUEST).send({
        message: "Invalid username",
        error: message.BAD_REQUEST,
      });

    if (!pass || typeof pass !== "string")
      return res.status(statusCode.BAD_REQUEST).send({
        message: "Invalid password",
        error: message.BAD_REQUEST,
      });

    if (!email || typeof email !== "string")
      return res.status(statusCode.BAD_REQUEST).send({
        message: "Invalid email",
        error: message.BAD_REQUEST,
      });

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(statusCode.CONFLICT).send(message.CONFLICT);
    }

    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res
        .status(statusCode.CONFLICT)
        .json({ error: "Email already exists." });
    }

    const hashedPassword = await generateHashPassword(pass);

    const imagePaths = image.map((img) => img.filename);
    const newUser = await User.create({
      username: username,
      password: hashedPassword,
      role: role,
      email: email,
      images: imagePaths,
    });
    return res.status(statusCode.CREATED).json({
      message: message.CREATED,
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
        images: newUser.images,
      },
    });
  } catch (err) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(err.message.INTERNAL_SERVER_ERROR);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, pass, email } = req.body;

    if (!username || typeof username !== "string")
      return res
        .status(statusCode.BAD_REQUEST)
        .send({ message: "Invalid username", error: message.BAD_REQUEST });

    if (!pass || typeof pass !== "string")
      return res
        .status(statusCode.BAD_REQUEST)
        .send({ message: "Invalid password", error: message.BAD_REQUEST });

    if (!email || typeof email !== "string")
      return res
        .status(statusCode.BAD_REQUEST)
        .send({ message: "Invalid email", error: message.BAD_REQUEST });

    const user = username
      ? await User.findOne({ username })
      : await User.findOne({ email });

    if (!user) {
      return res.status(statusCode.NOT_FOUND).send({
        message: message.NOT_FOUND,
      });
    }

    const validPass = await comparePassword(pass, user.password);
    if (!validPass) {
      return res
        .status(statusCode.UNAUTHORIZED)
        .send({ message: message.UNAUTHORIZED });
    }

    const token = generateToken(
      { userId: user._id, username: user.username, role: user.role },
      SECRET_KEY,
      TOKEN_EXPIRATION,
    );

    return res.status(statusCode.SUCCESS).json({
      message: message.SUCCESS,
      user,
      token,
    });
  } catch (err) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(err.message.INTERNAL_SERVER_ERROR);
  }
};

exports.getUser = async (req, res) => {
  try {
    const { userId, username, role } = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(statusCode.NOT_FOUND)
        .json({ error: "User not found." });
    }

    const imageUrl = user.images.map(
      (image) => `${req.protocol}://${req.get("host")}/uploads/${image}`,
    );

    const key = `user:${req.user.userId}`;
    const cachedData = await getDataFromCache(key);
    if (cachedData) {
      console.log("cache hit");
      return res.status(statusCode.SUCCESS).json({
        message: `Welcome ${username} (${role})!`,
        user: {
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          images: imageUrl,
        },
      });
    }

    const value = user;
    console.log("cache miss");
    saveDataInCache(key, value);

    return res.status(statusCode.SUCCESS).json({
      message: `Welcome ${username} (${role})!`,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        images: imageUrl,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error." });
  }
};

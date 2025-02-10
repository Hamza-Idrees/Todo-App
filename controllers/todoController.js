const Todo = require("../model/todoSchema");
const { statusCode, message } = require("../constants/statusCodes");
const {
  saveDataInCache,
  getDataFromCache,
  deleteDataFromCache,
} = require("../helper/redisFunction");
require("dotenv").config();

exports.createTask = async (req, res) => {
  try {
    const { name, desc, date } = req.body;

    const user = req.user;

    if (!name || typeof name !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    if (!desc || typeof desc !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    if (!date || typeof date !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    const todo = await Todo.create({
      taskName: name,
      taskDescription: desc,
      date: date,
      userId: user.userId,
    });

    return res.status(statusCode.CREATED).send({
      message: message.CREATED,
      task: todo,
    });
  } catch (err) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(err.message.INTERNAL_SERVER_ERROR);
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const user = req.user;
    const key = `key:${user.userId}`;
    const cachedData = await getDataFromCache(key);
    if (cachedData) {
      console.log("cache hit");
      return res
        .status(statusCode.SUCCESS)
        .json({ message: JSON.parse(cachedData) });
    }
    const todo = await Todo.find({ userId: user.userId });

    const value = todo;
    saveDataInCache(key, value);
    console.log("cache miss");

    return res.status(statusCode.SUCCESS).json(todo);
  } catch (err) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(err.message.INTERNAL_SERVER_ERROR);
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = req.user;
    const key = `key:${id}`;
    if (!id || typeof id !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    const cachedData = await getDataFromCache(key);
    if (cachedData) {
      console.log("cache hit");
      return res
        .status(statusCode.SUCCESS)
        .json({ message: JSON.parse(cachedData) });
    }

    const taskFind = await Todo.findOne({ _id: id, userId: user.userId });
    if (taskFind) {
      const value = taskFind;
      saveDataInCache(key, value);
      console.log("cache miss");
      return res.status(statusCode.SUCCESS).json({
        task: taskFind,
        role: user.role,
      });
    } else {
      return res.status(statusCode.NOT_FOUND).json(message.NOT_FOUND);
    }
  } catch (err) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(err.message.INTERNAL_SERVER_ERROR);
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, desc, status, date } = req.body;
    const user = req.user;

    if (!id || typeof id !== "string")
      return res.status(statusCode.BAD_REQUEST).send({
        error: message.BAD_REQUEST,
        message: "Invalid Id",
      });

    if (!name || typeof name !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    if (!desc || typeof desc !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    if (!date || typeof date !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    if (status !== undefined) {
      if (typeof status !== "boolean") {
        return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);
      }
      if (user.role !== "admin") {
        return res.status(statusCode.FORBIDDEN).send({
          error: message.FORBIDDEN,
          message: "Only admin can update the status field.",
        });
      }
    }

    const taskFind = await Todo.findOne({ _id: id, userId: user.userId });

    if (taskFind) {
      if (name) taskFind.taskName = name;
      if (desc) taskFind.taskDescription = desc;
      if (user.role === "admin" && status !== undefined)
        taskFind.status = status;
      if (date) taskFind.date = date;
      await taskFind.save();

      const taskCacheKey = `task:${id}`;
      await saveDataInCache(taskCacheKey, taskFind);

      await deleteDataFromCache(`tasks:${user.userId}`);

      return res.status(statusCode.SUCCESS).send({
        message: message.SUCCESS,
        task: taskFind,
      });
    } else {
      return res.status(statusCode.NOT_FOUND).json(message.NOT_FOUND);
    }
  } catch (err) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(err.message.INTERNAL_SERVER_ERROR);
  }
};

exports.updateSpecificField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, desc, status, date } = req.body;
    const user = req.user;

    if (!id || typeof id !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    if (name !== undefined && typeof name !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    if (desc !== undefined && typeof desc !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    if (date !== undefined && typeof date !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    const taskFind = await Todo.findOne({ _id: id, userId: user.userId });

    if (taskFind) {
      if (name !== undefined) taskFind.taskName = name;
      if (desc !== undefined) taskFind.taskDescription = desc;
      if (date !== undefined) taskFind.date = date;
      await taskFind.save();
      return res.status(statusCode.SUCCESS).send({
        message: message.SUCCESS,
        task: taskFind,
      });
    }
  } catch (err) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(err.message.INTERNAL_SERVER_ERROR);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || typeof id !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    if (typeof status !== "boolean")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    const statusUpdate = await Todo.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (statusUpdate) {
      return res.status(statusCode.SUCCESS).json({
        message: message.SUCCESS,
        status,
        task: statusUpdate,
      });
    } else {
      return res.status(statusCode.NOT_FOUND).json(message.NOT_FOUND);
    }
  } catch (err) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(err.message.INTERNAL_SERVER_ERROR);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id || typeof id !== "string")
      return res.status(statusCode.BAD_REQUEST).send(message.BAD_REQUEST);

    const key = `key:${id}`;

    const taskFind = await Todo.findOne({ _id: id, userId: user.userId });

    if (taskFind) {
      await taskFind.deleteOne();
      await deleteDataFromCache(key);
      console.log("cache hit");
      return res.status(statusCode.DELETED).send({
        message: message.DELETED,
        task: taskFind,
      });
    } else {
      return res.status(statusCode.NOT_FOUND).json(message.NOT_FOUND);
    }
  } catch (err) {
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(err.message.INTERNAL_SERVER_ERROR);
  }
};

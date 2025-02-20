const Todo = require("../model/todoSchema");
const Response = require("../constants/statusCodes");
const TodoConstant = require("../constants/todoTypes");
const Redis = require('../helper/redisFunction');
require("dotenv").config();

module.exports = {
  createTask : async (req, res) => {
    try {
      const { body, user } = req;

      if (!body?.name || typeof body?.name !== TodoConstant?.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      if (!body?.desc || typeof body?.desc !== TodoConstant?.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      if (!body?.date || typeof body?.date !== TodoConstant?.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      const todo = await Todo.create({
        taskName: body?.name,
        taskDescription: body?.desc,
        date: body?.date,
        userId: user?.userId,
      });

      return res.status(Response?.statusCode?.CREATED).send({
        message: Response?.message?.CREATED,
        task: todo,
      });
    } catch (err) {
      return res
        .status(Response?.statusCode?.INTERNAL_SERVER_ERROR)
        .send(err?.Response?.message?.INTERNAL_SERVER_ERROR);
    }
  },

  getAllTasks : async (req, res) => {
    try {
      const { user } = req;
      const key = `key:${user?.userId}`;
      const cachedData = await Redis.getDataFromCache(key);
      if (cachedData) {
        console.log("cache hit");
        return res
          .status(Response?.statusCode?.SUCCESS)
          .json({ message: JSON?.parse(cachedData) });
      }
      const todo = await Todo.find({ userId: user?.userId });

      const value = todo;
      Redis.saveDataInCache(key, value);
      console.log("cache miss");

      return res.status(Response?.statusCode?.SUCCESS).json(todo);
    } catch (err) {
      return res
        .status(Response?.statusCode?.INTERNAL_SERVER_ERROR)
        .send(err?.Response?.message?.INTERNAL_SERVER_ERROR);
    }
  },

  getTaskById : async (req, res) => {
    try {
      const { params, user } = req;

      const key = `key:${params?.id}`;
      if (!params?.id || typeof params?.id !== TodoConstant?.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      const cachedData = await Redis.getDataFromCache(key);
      if (cachedData) {
        console.log("cache hit");
        return res
          .status(Response?.statusCode?.SUCCESS)
          .json({ message: JSON?.parse(cachedData) });
      }

      const taskFind = await Todo.findOne({ _id: params?.id, userId: user?.userId });
      if (taskFind) {
        const value = taskFind;
        Redis.saveDataInCache(key, value);
        console.log("cache miss");
        return res.status(Response?.statusCode?.SUCCESS).json({
          task: taskFind,
          role: user?.role,
        });
      } else {
        return res.status(Response?.statusCode?.NOT_FOUND).json(Response?.message?.NOT_FOUND);
      }
    } catch (err) {
      return res
        .status(Response?.statusCode?.INTERNAL_SERVER_ERROR)
        .send(err?.Response?.message?.INTERNAL_SERVER_ERROR);
    }
  },

  updateTask : async (req, res) => {
    try {
      const { params, body, user } = req;

      if (!params?.id || typeof params?.id !== TodoConstant.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send({
          error: Response?.message?.BAD_REQUEST,
          message: "Invalid Id",
        });

      if (!body?.name || typeof body?.name !== TodoConstant.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      if (!body?.desc || typeof body?.desc !== TodoConstant.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      if (!body?.date || typeof body?.date !== TodoConstant.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      if (body?.status !== undefined) {
        if (typeof body?.status !== TodoConstant.Boolean) {
          return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);
        }
        if (user?.role !== "admin") {
          return res.status(Response?.statusCode?.FORBIDDEN).send({
            error: Response?.message.FORBIDDEN,
            message: "Only admin can update the status field.",
          });
        }
      }

      const taskFind = await Todo.findOne({ _id: params?.id, userId: user?.userId });

      if (taskFind) {
        if (body?.name)
          taskFind?.taskName = name;
        if (body?.desc)
          taskFind?.taskDescription = desc;
        if (user?.role === "admin" && status !== undefined)
          taskFind?.status = status;
        if (body?.date)
          taskFind?.date = date;
        await taskFind.save();

        const taskCacheKey = `task:${params?.id}`;
        await Redis.saveDataInCache(taskCacheKey, taskFind);

        await Redis.deleteDataFromCache(`tasks:${user?.userId}`);

        return res.status(Response?.statusCode?.SUCCESS).send({
          message: Response?.message?.SUCCESS,
          task: taskFind,
        });
      } else {
        return res.status(Response?.statusCode?.NOT_FOUND).json(Response?.message?.NOT_FOUND);
      }
    } catch (err) {
      return res
        .status(Response?.statusCode?.INTERNAL_SERVER_ERROR)
        .send(err?.Response?.message?.INTERNAL_SERVER_ERROR);
    }
  },

  updateSpecificField : async (req, res) => {
    try {
      const { user, params, body } = req;

      if (!params?.id || typeof params?.id !== TodoConstant.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      if (body?.name !== undefined && typeof body?.name !== TodoConstant.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      if (body?.desc !== undefined && typeof body?.desc !== TodoConstant.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      if (body?.date !== undefined && typeof body?.date !== TodoConstant.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      const taskFind = await Todo.findOne({ _id: params?.id, userId: user?.userId });

      if (taskFind) {
        if (body?.name !== undefined)
          taskFind?.taskName = name;
        if (body?.desc !== undefined)
          taskFind?.taskDescription = desc;
        if (body?.date !== undefined)
          taskFind?.date = date;

        await taskFind.save();
        return res.status(Response.statusCode.SUCCESS).send({
          message: Response.message.SUCCESS,
          task: taskFind,
        });
      }
    } catch (err) {
      return res
        .status(Response?.statusCode?.INTERNAL_SERVER_ERROR)
        .send(err?.Response?.message?.INTERNAL_SERVER_ERROR);
    }
  },

  updateStatus : async (req, res) => {
    try {
      const { params, body } = req;

      if (!params?.id || typeof params?.id !== TodoConstant?.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      if (typeof body?.status !== TodoConstant?.Boolean)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      const statusUpdate = await Todo.findByIdAndUpdate(
        params?.id,
        { status: body?.status },
        { new: true },
      );

      if (statusUpdate) {
        return res.status(Response?.statusCode?.SUCCESS).json({
          message: Response?.message?.SUCCESS,
          status: body?.status,
          task: statusUpdate,
        });
      } else {
        return res.status(Response?.statusCode?.NOT_FOUND).json(Response?.message?.NOT_FOUND);
      }
    } catch (err) {
      return res
        .status(Response?.statusCode?.INTERNAL_SERVER_ERROR)
        .send(err?.Response?.message?.INTERNAL_SERVER_ERROR);
    }
  },

  deleteTask : async (req, res) => {
    try {
      const { params, user } = req;

      if (!params?.id || typeof params?.id !== TodoConstant?.String)
        return res.status(Response?.statusCode?.BAD_REQUEST).send(Response?.message?.BAD_REQUEST);

      const key = `key:${params?.id}`;

      const taskFind = await Todo.findOne({ _id: params?.id, userId: user?.userId });

      if (taskFind) {
        await taskFind.deleteOne();
        await Redis.deleteDataFromCache(key);
        console.log("cache hit");
        return res.status(Response?.statusCode?.DELETED).send({
          message: Response?.message?.DELETED,
          task: taskFind,
        });
      } else {
        return res.status(Response?.statusCode?.NOT_FOUND).json(Response?.message?.NOT_FOUND);
      }
    } catch (err) {
      return res
        .status(Response?.statusCode?.INTERNAL_SERVER_ERROR)
        .send(err?.Response?.message?.INTERNAL_SERVER_ERROR);
    }
  }
}
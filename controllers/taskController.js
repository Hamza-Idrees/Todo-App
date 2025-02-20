const Todo = require("../model/todoSchema");
const Response = require("../constants/statusCodes");
const TodoConstant = require("../constants/todoTypes");
const UserConstant = require('../constants/userConstant');
const Redis = require('../helper/redisFunction');
require("dotenv").config();

module.exports = {
  create: async (req, res) => {
    try {
      const { body, user } = req;

      if (!body?.name || typeof body?.name !== TodoConstant?.string)
        return res.status(Response?.statusCode?.badRequest).json(Response?.message?.badRequest);

      if (!body?.desc || typeof body?.desc !== TodoConstant?.string)
        return res.status(Response?.statusCode?.badRequest).json(Response?.message?.badRequest);

      if (!body?.date || typeof body?.date !== TodoConstant?.string)
        return res.status(Response?.statusCode?.badRequest).json(Response?.message?.badRequest);

      const todo = await Todo.create({
        taskName: body?.name,
        taskDescription: body?.desc,
        date: body?.date,
        userId: user?.userId,
      });

      return res.status(Response?.statusCode?.created).json({
        message: Response?.message?.created,
        task: todo,
      });
    } catch (err) {
      return res
        .status(Response?.statusCode?.internalServerError)
        .json(Response?.message?.internalServerError);
    }
  },

  getAll: async (req, res) => {
    try {
      const { user } = req;
      const key = `key:${user?.userId}`;
      const cachedData = await Redis.getDataFromCache(key);
      if (cachedData) {
        return res
          .status(Response?.statusCode?.success)
          .json({ message: JSON?.parse(cachedData) });
      }
      const todo = await Todo.find({ userId: user?.userId });

      Redis.saveDataInCache(key, todo);

      return res.status(Response?.statusCode?.success).json(todo);
    } catch (err) {
      return res
        .status(Response?.statusCode?.internalServerError)
        .json(Response?.message?.internalServerError);
    }
  },

  get: async (req, res) => {
    try {
      const { params, user } = req;

      const key = `key:${params?.id}`;
      if (!params?.id || typeof params?.id !== TodoConstant?.string)
        return res.status(Response?.statusCode?.badRequest).json(Response?.message?.badRequest);

      const cachedData = await Redis.getDataFromCache(key);

      if (cachedData) {
        return res
          .status(Response?.statusCode?.success)
          .json({ message: JSON?.parse(cachedData) });
      }

      const taskFind = await Todo.findOne({ _id: params?.id, userId: user?.userId });

      if (taskFind) {
        Redis.saveDataInCache(key, taskFind);
        return res.status(Response?.statusCode?.success).json({
          task: taskFind,
          role: user?.role,
        });
      } else {
        return res.status(Response?.statusCode?.notFound).json(Response?.message?.notFound);
      }
    } catch (err) {
      return res
        .status(Response?.statusCode?.internalServerError)
        .json(Response?.message?.internalServerError);
    }
  },

  update: async (req, res) => {
    try {
      const { params, body, user } = req;

      if (!params?.id || typeof params?.id !== TodoConstant?.string) {
        return res.status(Response?.statusCode?.badRequest).json({
          error: Response?.message?.badRequest,
          message: UserConstant.invalidId,
        });
      }

      if (body?.name !== undefined && typeof body?.name !== TodoConstant.string) {
        return res.status(Response?.statusCode?.badRequest).json({
          error: Response?.message?.badRequest,
          message: UserConstant.invalidName,
        });
      }

      if (body?.desc !== undefined && typeof body?.desc !== TodoConstant.string) {
        return res.status(Response?.statusCode?.badRequest).json({
          error: Response?.message?.badRequest,
          message: UserConstant.invalidDescription,
        });
      }

      if (body?.date !== undefined && typeof body?.date !== TodoConstant.string) {
        return res.status(Response?.statusCode?.badRequest).json({
          error: Response?.message?.badRequest,
          message: UserConstant.invalidDate,
        });
      }

      if (body?.status !== undefined) {
        if (typeof body?.status !== TodoConstant.boolean) {
          return res.status(Response?.statusCode?.badRequest).json({
            error: Response?.message?.badRequest,
            message: UserConstant.invalidStatus,
          });
        }

        if (user?.role !== UserConstant?.role) {
          return res.status(Response?.statusCode?.forbidden).json({
            error: Response?.message?.forbidden,
            message: UserConstant.message,
          });
        }
      }

      const taskFind = await Todo.findOne({ _id: params?.id, userId: user?.userId });

      if (!taskFind) {
        return res.status(Response?.statusCode?.notFound)
        .json(Response?.message?.notFound);
      }

      if (body?.name !== undefined) taskFind.taskName = body?.name;
      if (body?.desc !== undefined) taskFind.taskDescription = body?.desc;
      if (body?.date !== undefined) taskFind.date = body?.date;
      if (body?.status !== undefined && user?.role === UserConstant?.role) {
        taskFind.status = body?.status;
      }

      await taskFind.save();

      const taskCacheKey = `task:${params?.id}`;
      await Redis.saveDataInCache(taskCacheKey, taskFind);
      await Redis.deleteDataFromCache(`tasks:${user?.userId}`);

      return res.status(Response?.statusCode?.success).json({
        message: Response?.message?.success,
        task: taskFind,
      });

    } catch (err) {
      return res.status(Response?.statusCode?.internalServerError)
      .json(Response?.message?.internalServerError);
    }
  },


  delete: async (req, res) => {
    try {
      const { params, user } = req;

      if (!params?.id || typeof params?.id !== TodoConstant?.string)
        return res.status(Response?.statusCode?.badRequest).json(Response?.message?.badRequest);

      const key = `key:${params?.id}`;

      const taskFind = await Todo.findOne({ _id: params?.id, userId: user?.userId });

      if (taskFind) {
        await taskFind.deleteOne();
        await Redis.deleteDataFromCache(key);
        return res.status(Response?.statusCode?.deleted).json({
          message: Response?.message?.deleted,
          task: taskFind,
        });
      } else {
        return res.status(Response?.statusCode?.notFound).json(Response?.message?.notFound);
      }
    } catch (err) {
      return res
        .status(Response?.statusCode?.internalServerError)
        .json(Response?.message?.internalServerError);
    }
  }
}
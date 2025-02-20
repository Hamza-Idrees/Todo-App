const express = require("express");
const router = express.Router();
const todoController = require("../controllers/taskController");
const authenticate = require("../middleware/tokenValidator");
const roleAdmin = require("../middleware/roleValidator");

/**
 * @swagger
 * tags:
 *   - name: todo
 * paths:
 *   /task:
 *     post:
 *       tags:
 *         - todo
 *       summary: create task
 *       description: create a new task against a user
 *       requestBody:
 *         description: create new task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTask'
 *         required: true
 *       responses:
 *         200:
 *           description: new task is created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/CreateTask'
 *       security:
 *         - bearerAuth: []
 *
 *   /tasks:
 *     get:
 *       tags:
 *         - todo
 *       summary: get tasks
 *       description: get all tasks against a specific user
 *       responses:
 *         200:
 *           desciption: tasks fetches successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/CreateTask'
 *         404:
 *           description: tasks not found
 *       security:
 *         - bearerAuth: []
 *
 *   /task/{id}:
 *     get:
 *       tags:
 *         - todo
 *       summary: get specific task
 *       description: get task by giving specific id
 *       parameters:
 *         - in: path
 *           name: id
 *           type: uuid
 *           required: true
 *       responses:
 *         200:
 *           description: specific task get fetched successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/CreateTask'
 *         404:
 *           description: task not find by id
 *       security:
 *         - bearerAuth: []
 *
 *     put:
 *       tags:
 *         - todo
 *       summary: update task
 *       description: update specific task
 *       parameters:
 *         - in: path
 *           name: id
 *           type: uuid
 *           required: true
 *       requestBody:
 *         description: update a specific task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateTask'
 *         required: true
 *       responses:
 *         200:
 *           description: specific task updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/UpdateTask'
 *         404:
 *           description: task not find by id
 *       security:
 *         - bearerAuth: []
 *
 *     delete:
 *       tags:
 *         - todo
 *       summary: delete specific task
 *       description: delete task by giving specific id
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           type: uuid
 *       responses:
 *         204:
 *           description: task deleted successfully
 *       security:
 *         - bearerAuth: []
 *
 *   /tasks/{id}:
 *     patch:
 *       tags:
 *         - todo
 *       summary: update task
 *       description: update specific field of task
 *       requestBody:
 *         description: update a specific field of task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateSpecificField'
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           type: uuid
 *       responses:
 *         200:
 *           description: specific task updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/UpdateSpecificField'
 *       security:
 *         - bearerAuth: []
 *
 *   /task/{id}/status:
 *     patch:
 *       tags:
 *         - todo
 *       summary: update task status
 *       description: update status field of task
 *       requestBody:
 *         description: update a status field of task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateStatusField'
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           type: uuid
 *       responses:
 *         200:
 *           description: status field updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/UpdateStatusField'
 *       security:
 *         - bearerAuth: []
 *
 * components:
 *   schemas:
 *     CreateTask:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: new task
 *         desc:
 *           type: string
 *           example: new task is created
 *         date:
 *           type: string
 *           example: January 9, 2025
 *     UpdateTask:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: updated task
 *         desc:
 *           type: string
 *           example: task is updated
 *         date:
 *           type: string
 *           example: January 10, 2025
 *     UpdateSpecificField:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: updated task
 *         desc:
 *           type: string
 *           example: task is updated
 *         date:
 *           type: string
 *           example: January 10, 2025
 *     UpdateStatusField:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: admin
 *
 * securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */
router.post("/task", authenticate, todoController.create);
router.get("/tasks", authenticate, todoController.getAll);
router.get("/task/:id", authenticate, todoController.get);
router.patch("/task/:id", authenticate, todoController.update);
router.delete("/task/:id", authenticate, todoController.delete);

/*
router.put("/task/:id", authenticate, todoController.updateTask);
router.patch(
  "/tasks/:id",
  authenticate,
  roleAdmin,
  todoController.updateSpecificField,
);
router.patch(
  "/task/:id/status",
  authenticate,
  roleAdmin,
  todoController.updateStatus,
);
*/

module.exports = router;

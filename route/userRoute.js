const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middleware/tokenValidator");
const upload = require("../middleware/multerConfig");

/**
 * @swagger
 * tags:
 *   - name: user
 * paths:
 *   /register:
 *     post:
 *       tags:
 *         - user
 *       summary: create user
 *       description: create a new user with images
 *       requestBody:
 *         description: create a new user
 *         content:
 *           multipart/form-data:
 *             schema:
 *               $ref: '#/components/schemas/RegisterUser'
 *         required: true
 *       responses:
 *         200:
 *           description: user created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/RegisterUser'
 *         400:
 *           description: Invalid username
 *         404:
 *           description: Not found
 *         409:
 *           description: user already exists
 *         500:
 *           description: Internal Server Error
 *   /login:
 *     post:
 *       tags:
 *          - user
 *       summary: login user
 *       description: login registred user
 *       requestBody:
 *         description: login user with valid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginUser'
 *       required: true
 *       responses:
 *         200:
 *           description: user login successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/LoginUser'
 *         400:
 *           description: Invalid username
 *         404:
 *           description: Not found
 *         500:
 *           description: Internal Server Error
 *   /:
 *     get:
 *       tags:
 *         - user
 *       summary: get user
 *       description: get user with valid id
 *       responses:
 *         200:
 *           $ref: '#/components/schemas/AuthorizedUser'
 *         401:
 *           $ref: '#/components/schemas/UnauthorizedUser'
 *       security:
 *         - bearerAuth: []
 *
 *components:
 *  schemas:
 *    RegisterUser:
 *      type: object
 *      properties:
 *        username:
 *          type: string
 *          example: usman
 *        pass:
 *          type: string
 *          example: usman
 *        email:
 *          type: string
 *          example: usman@gmail.com
 *        role:
 *          type: string
 *          enum: [user, admin]
 *          default: user
 *        images:
 *          type: array
 *          items:
 *            type: string
 *            format: binary
 *    LoginUser:
 *      type: object
 *      properties:
 *        username:
 *          type: string
 *          example: usman
 *        pass:
 *          type: string
 *          example: usman
 *        email:
 *          type: string
 *          example: usman@gmail.com
 *    AuthorizedUser:
 *      description: user fetched successfully
 *    UnauthorizedUser:
 *      description: Access token is expired or invalid
 *
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 */
router.post("/register", upload.array("images", 2), userController.createUser);
router.post("/login", userController.loginUser);
router.get("/", authenticate, userController.getUser);

module.exports = router;

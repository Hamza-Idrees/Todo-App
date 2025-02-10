const statusCode = {
  SUCCESS: 200,
  CREATED: 201,
  DELETED: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  CONFLICT: 409,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500,
};

const message = {
  SUCCESS: "Success",
  CREATED: "Resource created successfully",
  DELETED: "Resource deleted successfully",
  BAD_REQUEST: "Bad request",
  NOT_FOUND: "Not found",
  FORBIDDEN: "Forbidden",
  CONFLICT: "Conflict",
  UNAUTHORIZED: "Unauthorized",
  INTERNAL_SERVER_ERROR: "Internal server error",
};

module.exports = { statusCode, message };

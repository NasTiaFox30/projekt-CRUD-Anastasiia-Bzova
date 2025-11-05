export const sendBadRequestError = (res, message) => {
  return res.status(400).json({
    timestamp: new Date().toISOString(),
    status: 400,
    error: "Bad Request",
    message
  });
};

export const sendUnauthorizedError = (res, message = "Unauthorized") => {
  return res.status(401).json({
    timestamp: new Date().toISOString(),
    status: 401,
    error: "Unauthorized",
    message
  });
};

export const sendForbiddenError = (res, message = "Forbidden") => {
  return res.status(403).json({
    timestamp: new Date().toISOString(),
    status: 403,
    error: "Forbidden",
    message
  });
};

export const sendNotFoundError = (res, message = "Not Found") => {
  return res.status(404).json({
    timestamp: new Date().toISOString(),
    status: 404,
    error: "Not Found",
    message
  });
};

export const sendConflictError = (res, message) => {
  return res.status(409).json({
    timestamp: new Date().toISOString(),
    status: 409,
    error: "Conflict",
    message
  });
};

export const sendValidationError = (res, fieldErrors) => {
  return res.status(422).json({
    timestamp: new Date().toISOString(),
    status: 422,
    error: "Unprocessable Entity",
    message: "Validation failed",
    fieldErrors
  });
};
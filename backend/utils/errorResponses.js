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

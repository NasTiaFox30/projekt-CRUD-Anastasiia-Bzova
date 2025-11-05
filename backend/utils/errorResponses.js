export const sendBadRequestError = (res, message) => {
  return res.status(400).json({
    timestamp: new Date().toISOString(),
    status: 400,
    error: "Bad Request",
    message
  });
};

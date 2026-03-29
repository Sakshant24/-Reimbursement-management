exports.success = (res, data, message = 'OK', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

exports.error = (res, message, statusCode = 400, data = null) =>
  res.status(statusCode).json({ success: false, message, data });

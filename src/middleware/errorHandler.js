export default function errorHandler(err, req, res, next) {
  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  res.status(status).json({success:false,error:{message:status === 500 ? 'Something went wrong. Please try again.' : err.message}});
}

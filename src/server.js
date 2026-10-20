import app from './app.js';
const server=app.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Taskora is running on port '+(process.env.PORT||3000)));
process.on('SIGTERM',()=>server.close());

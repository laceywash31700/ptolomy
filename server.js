const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socket = require('socket.io');

const app = express();

app.options('*', cors()); // Handle preflight requests

// Configure CORS for Express
app.use(
  cors({
    origin: [
      'http://localhost:3000', // Development server
      "http://localhost:5174",
      'http://127.0.0.1:5173', // Another local development URL
      'https://ptolemyvtt.netlify.app',// Production domain
      'https://66e07ee8a957bc6cb184ddb0--ptolemyvtt.netlify.app' 
    ],
    methods: ['GET', 'POST'],
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('This is the back end of Ptolemy'));

const server = http.createServer(app);

// const io = new socket.Server(server, {
//   cors: {
//     origin: [
//       'http://localhost:3000',
//       "http://localhost:5174",
//       'http://127.0.0.1:5173',
//       'https://ptolemyvtt.netlify.app',
//       'https://66e07ee8a957bc6cb184ddb0--ptolemyvtt.netlify.app'// Netlify Preview URL
//     ],
//     methods: ['GET', 'POST'],
//     transports: ['websocket'],
//   },
// });

// const connectedClients = new Map();

// io.on('connection', (socket) => {
//   connectedClients.set(socket.id, socket);
//   console.log(`User ${socket.id} connected`);
//   console.log('Currently connected clients:', Array.from(connectedClients.keys()));

//   socket.on('message', (data) => {
//     console.log(data);
//     io.emit('message', `${socket.id.substring(0, 5)} - ${data}`);
//   });

//   socket.on("update-token-position", (tokenData) => {
//     console.log(`this is the new position coming from ${socket.id}:`, tokenData)
//     // Broadcast the new position to all other clients
//     socket.broadcast.emit("update-token-position-broadcast", tokenData);
//   });
  
//   socket.on("new-token", (tokenData) => {
//     console.log(`this is the new token coming from ${socket.id}:`, tokenData)
//     // This will broadcast the new token obj to all other clients expect the emitter client.
//     socket.broadcast.emit("new-token-broadcast", tokenData);
//   });

//   socket.on("changing-src", (data) => {
//     console.log("Received src change:", data);
//     socket.broadcast.emit("src-changes", data)
//   })
  
//   // Handle disconnection
//   socket.on('disconnect', () => {
//     connectedClients.delete(socket.id);
//     console.log('User disconnected:', socket.id);
//     console.log('Currently connected clients:', Array.from(connectedClients.keys()));
//   });
// });

module.exports = {
  server,
  startUp: (port) => {
    server.listen(port, () => {
      console.log(`Server is up and running on ${port}`);
    });
  },
};

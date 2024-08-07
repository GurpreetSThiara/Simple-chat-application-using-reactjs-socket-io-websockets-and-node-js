import express from 'express'; // Import the express module to create a web server
import cors from 'cors'; // Import the cors module to enable Cross-Origin Resource Sharing
import { Server } from 'socket.io'; // Import the Server class from the socket.io module to enable real-time bidirectional event-based communication
import { createServer } from 'http'; // Import the createServer function from the http module to create an HTTP server

// Create an instance of an Express application
const app = express();

// Create an HTTP server using the Express application. This is necessary because we need a raw HTTP server to attach Socket.IO to it.
const httpServer = createServer(app);

// Create an instance of a Socket.IO server, and configure it with CORS settings.
// CORS (Cross-Origin Resource Sharing) is a security feature implemented by browsers to prevent unauthorized access to resources.
// Here, we specify that our Socket.IO server will accept connections from 'http://localhost:5173' and will allow GET and POST methods.
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // This allows our Socket.IO server to accept requests from the specified origin.
    methods: ['GET', 'POST'], // These are the HTTP methods that are allowed for cross-origin requests.
    credentials: true, // This allows cookies and other credentials to be included in requests.
  },
});

// Use the CORS middleware in the Express application. This allows our Express server to handle cross-origin requests.
// This is particularly useful for enabling communication between our front-end application running on a different port or domain.
app.use(cors());

// Define a simple GET route for the root URL ('/') of the Express application.
// When a client sends a GET request to the root URL, the server responds with the message 'Server is running'.
// This is a basic route to ensure that the server is running and can respond to HTTP requests.
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Create an object to keep track of connected users. This object will store the username and corresponding socket ID for each user.
// The key is the username and the value is the socket ID. This helps in identifying users and managing their connections.
const users = {};

// Set up an event listener for new Socket.IO connections.
// The 'connection' event is triggered whenever a new client connects to the Socket.IO server.
// The 'socket' parameter represents the individual connection instance for the connected client.
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`); // Log the connection event with the unique socket ID of the user.

  // Set up an event listener for the 'join' event. This event is emitted by the client when a user wants to join a chat room.
  // The 'data' parameter contains information about the room and username, and the 'callback' parameter is a function to send a response back to the client.
  socket.on('join', ({ room, username }, callback) => {
    if (users[username]) {
      // If the username already exists in the users object, it means that the username is already taken.
      // Call the callback function with an object indicating that the join request was unsuccessful and provide a message explaining the reason.
      callback({ success: false, message: 'Username is already taken' });
    } else {
      // If the username is not already taken, add the username and socket ID to the users object.
      users[username] = socket.id;
      // Join the specified room using the socket's join method. This allows the user to receive messages sent to this room.
      socket.join(room);
      console.log(`User ${username} (${socket.id}) joined room: ${room}`); // Log the event with the username, socket ID, and room name.
      // Emit a 'welcome' event to the client, sending a welcome message that includes the room name.
      socket.emit('welcome', `Welcome to room ${room}`);
      // Call the callback function with an object indicating that the join request was successful.
      callback({ success: true });
    }
  });

  // Set up an event listener for the 'message' event. This event is emitted by the client when a user sends a message.
  // The 'data' parameter contains information about the message, room, and username.
  socket.on('message', (data) => {
    const { message, room, username } = data; // Extract the message, room, and username from the data object.
    if (socket.rooms.has(room)) {
      // Check if the user is part of the room. The socket.rooms property is a set that contains the rooms the user has joined.
      console.log(`Message received from ${username}: ${message} in room: ${room}`); // Log the received message with the username and room name.
      // Emit a 'receive-message' event to all clients in the room, sending the message and username.
      io.in(room).emit('receive-message', { message, username });
    } else {
      // If the user is not part of the room, log a message indicating that the user attempted to send a message without joining the room.
      console.log(`User ${username} attempted to send a message to ${room} without joining`);
    }
  });

  // Set up an event listener for the 'disconnect' event. This event is triggered when a user disconnects from the Socket.IO server.
  socket.on('disconnect', () => {
    // Iterate over the users object to find the user that corresponds to the disconnected socket ID.
    for (const [username, id] of Object.entries(users)) {
      if (id === socket.id) {
        // If the socket ID matches, delete the user from the users object.
        delete users[username];
        break; // Exit the loop after finding and deleting the user.
      }
    }
    console.log(`User disconnected: ${socket.id}`); // Log the disconnection event with the socket ID of the user.
  });
});

// Start the HTTP server on port 3001. The server listens for incoming connections on this port.
// Once the server starts, log a message indicating that the server is running and specify the port number.
httpServer.listen(3001, () => {
  console.log('Server is running on port 3001');
});

# Simple-chat-application-using-reactjs-socket-io-websockets-and-node-js
# Chat Application 💬

Welcome to the Chat Application! This is a simple chat app built with React and Socket.IO, allowing users to join chat rooms and send messages in real-time.

## Table of Contents 📚

1. [Introduction](#introduction)
2. [Features](#features)
3. [Getting Started](#getting-started)
4. [How It Works](#how-it-works)
5. [Technologies Used](#technologies-used)
6. [Global Package Setup](#global-package-setup)


## Introduction 🚀

This chat application lets users:
- Enter a username and room name.
- Join a chat room.
- Send and receive messages in real-time.

## Features ✨

- **Real-time Messaging:** Send and receive messages instantly.
- **Room Management:** Join different rooms and chat with other users in the same room.
- **User Feedback:** Receive notifications for various actions, like joining a room or sending a message.

## Getting Started 🛠️

To get started with this application, follow these steps:

### Prerequisites ✅

- Node.js installed on your computer.
- A code editor (like Visual Studio Code).
- Basic knowledge of JavaScript and React.

### Installation 🔧

1. **Clone the Repository:**

   Open your terminal and run:

   ```bash
   git clone https://github.com/yourusername/chat-app.git
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd chat-app
   ```

3. **Install Dependencies:**

   Run the following command to install all required dependencies:

   ```bash
   npm install
   ```

4. **Start the Server:**

   Navigate to the `server` directory and start the server:

   ```bash
   cd server
   node index.js
   ```

5. **Start the Client:**

   Open a new terminal window, navigate to the `client` directory, and start the client:

   ```bash
   cd client
   npm start
   ```

   Your default browser should open and navigate to `http://localhost:3000`.

## How It Works 🔍

### Socket.IO Overview 🌐

**Socket.IO** is a library that enables real-time, bidirectional communication between a client (like a web browser) and a server. It operates over WebSockets but can also use other transport methods if WebSockets aren't supported.

Here’s how Socket.IO is used in our chat application:

1. **Connection:** The client connects to the server via Socket.IO, which assigns a unique socket ID.

2. **Real-time Communication:** Clients can emit events (like sending messages) to the server. The server listens for these events and broadcasts them to other clients in the same chat room.

3. **Rooms:** Socket.IO allows clients to join rooms. Messages sent to a room are received only by clients in that room, facilitating room-based conversations.

### Client-Side Code 🖥️

1. **Connecting to the Server:**

   ```javascript
   const socket = useMemo(() => io('http://localhost:3001'), []);
   ```

   This code establishes a connection to the server.

2. **Joining a Room:**

   ```javascript
   socket.emit('join', { room, username }, (response) => {
     if (response.success) {
       setIsAuthenticated(true);
       setDialogMessage(`Joined room ${room} successfully!`);
       setOpenDialog(true);
     } else {
       setSnackbarMessage(response.message);
       setSnackbarOpen(true);
     }
   });
   ```

   This code sends a request to join a room and updates the UI based on the server's response.

3. **Sending and Receiving Messages:**

   ```javascript
   socket.emit('message', newMessage);
   ```

   This code sends a message to the server.

   ```javascript
   socket.on('receive-message', (data) => {
     setMessages((prevMessages) => [...prevMessages, `${data.username}: ${data.message}`]);
   });
   ```

   This code updates the UI with new messages received from the server.

### Server-Side Code 🖥️

1. **Handling Connections:**

   ```javascript
   io.on('connection', (socket) => {
     console.log(`User connected: ${socket.id}`);
   });
   ```

   Logs when a user connects to the server.

2. **Joining a Room:**

   ```javascript
   socket.on('join', ({ room, username }, callback) => {
     if (users[username]) {
       callback({ success: false, message: 'Username is already taken' });
     } else {
       users[username] = socket.id;
       socket.join(room);
       callback({ success: true });
     }
   });
   ```

   Handles room join requests and updates the room.

3. **Sending Messages:**

   ```javascript
   socket.on('message', (data) => {
     io.in(data.room).emit('receive-message', { message: data.message, username: data.username });
   });
   ```

   Broadcasts messages to all clients in the same room.

4. **Disconnecting:**

   ```javascript
   socket.on('disconnect', () => {
     // Handle user disconnection
   });
   ```

   Cleans up user data when they disconnect.

## Technologies Used 🔧

- **React:** A JavaScript library for building user interfaces.
- **Socket.IO:** A library for real-time web applications enabling real-time, bidirectional communication.
- **Material-UI:** A React component library for Material Design.
- **Node.js:** JavaScript runtime built on Chrome's V8 engine.

## Global Package Setup 🌍

To manage both the client and server parts of the application, a global `package.json` is used.

### Dependencies 📦

- **`concurrently`**: Runs multiple npm scripts at once.
- **`dotenv`**: Loads environment variables from a `.env` file.

### Development Scripts 🛠️

- **`dev`**: Starts both backend and frontend servers concurrently.
  ```bash
  npm run dev
  ```

- **`frontend`**: Starts the React development server.
  ```bash
  npm run frontend
  ```

- **`backend`**: Starts the backend server with `nodemon` for automatic restarts.
  ```bash
  npm run backend
  ```

### Development Dependencies 🧰

- **`nodemon`**: Automatically restarts the server on file changes.

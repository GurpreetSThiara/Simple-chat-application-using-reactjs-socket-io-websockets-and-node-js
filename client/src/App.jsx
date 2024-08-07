import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import {
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  ThemeProvider,
  createTheme,
  Box,
} from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const ChatApp = () => {
  const socket = useMemo(() => io('http://localhost:3001'), []);
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [socketId, setSocketId] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!room) {
      setSnackbarMessage('Please join a room first.');
      setSnackbarOpen(true);
      return;
    }
    const newMessage = { message: currentMessage, room, username };
   // setMessages((prevMessages) => [...prevMessages, `${username}: ${currentMessage}`]);
    socket.emit('message', newMessage);
    setCurrentMessage('');
    setSnackbarMessage('Message sent successfully!');
    setSnackbarOpen(true);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (username.trim() && room.trim()) {
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
    } else {
      setSnackbarMessage('Username and room name are required.');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    socket.on('connect', () => {
      setSocketId(socket.id);
      setIsLoading(false);
    });

    socket.on('receive-message', (data) => {
      setMessages((prevMessages) => [...prevMessages, `${data.username}: ${data.message}`]);
    });

    socket.on('welcome', (message) => {
      console.log(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress color="primary" />
          </Box>
        ) : !isAuthenticated ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            <Typography variant="h4" component="div" gutterBottom>
              Enter your username and room name
            </Typography>
            <TextField
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id="username"
              label="Username"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              id="room"
              label="Room Name"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleJoinRoom}>
              Join Room
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="h4" component="div" gutterBottom>
              Welcome {username} (ID: {socketId})
            </Typography>
            <Box my={2}>
              {messages.map((msg, index) => (
                <Typography key={index} variant="body1" sx={{ background: '#f1f1f1', p: 1, borderRadius: 1, mb: 1 }}>
                  {msg}
                </Typography>
              ))}
            </Box>
            <form onSubmit={handleSendMessage}>
              <TextField
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                id="current-message"
                variant="outlined"
                label="Message"
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Send
              </Button>
            </form>
          </>
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Room Joined</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{dialogMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary" autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Container>
    </ThemeProvider>
  );
};

export default ChatApp;

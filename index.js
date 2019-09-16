const express = require('express');
const socketIOClient = require('socket.io-client');
const app = express();

const proxy = new Proxy([], {
  set(target, item, value) {
    if (isNaN(value) && !!value) {
      console.log(`${value.user.firstName} ${value.user.lastName}:`, value.message);
    }
    return true;
  }
});

const io = socketIOClient.connect('http://localhost:3000');

io.on('ALL_MESSAGES_RECEIVED', (data) => {
  if (data.length > 0) {
    data.forEach((value) => {
      proxy.push(value);
    });
  }
});

io.on('A_MESSAGE_SENT', (data) => {
  proxy.push(data);
});

app.use(express.json());

app.post('/chat', (req, res) => {
  const { userId, message } = req.body;
  const data = {
    userId,
    message
  };
  io.emit('SEND_A_MESSAGE', data);
  res.json({
    message: "Message sent"
  });
});

app.listen(4500, () => {
  console.log('Listening');
  io.emit('GET_ALL_MESSAGES');
});

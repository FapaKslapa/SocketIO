const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let chats = [];
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  // Unisciti a una room specifica
  socket.on("join room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
    // Se la chat non esiste ancora, la creiamo
    if (!chats.find((chat) => chat.chat === room)) {
      chats.push({ chat: room, messaggi: [] });
    }
  });

  // Ascolta i messaggi di chat e li trasmette a tutti nella stessa room
  socket.on("chat message", (room, { username, message, timestamp }) => {
    // Modifica per accettare un oggetto con username e messaggio
    io.to(room).emit("chat message", { username, message, timestamp }); // Trasmetti l'username e il messaggio
    let chat = chats.find((chat) => chat.chat === room);
    if (chat) {
      chat.messaggi.push({
        autore: username,
        ora: timestamp,
        messaggio: message,
      });
    }

    console.log(chats);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("message", (data) => {});
});

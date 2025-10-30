const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // ✅ ensure correct views folder
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
  console.log("✅ New user connected:", socket.id);

  // When a user sends location data
  socket.on("send-location", function (data) {
    // broadcast to everyone else
    io.emit("receive-location", { id: socket.id, ...data });
  });

  // When user disconnects, notify others to remove their marker
  socket.on("disconnect", function () {
    console.log("❌ User disconnected:", socket.id);
    io.emit("user-disconnected", socket.id);
  });
});

app.get("/", function (req, res) {
  res.render("index");
});

server.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});

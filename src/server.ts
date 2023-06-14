import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// config
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  const { signingSecret, token, emoji } = socket.handshake.query as any;

  socket.on("updateStatus", (status) => {});
});

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
});

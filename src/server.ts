import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { App } from "@slack/bolt";

// config
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", async (socket) => {
  const { signingSecret, token } = socket.handshake.auth as any;
  let { emoji } = socket.handshake.query as any;
  console.log(signingSecret,token);
  if (!signingSecret || !token) {
    console.log("no signing secret or no token");
    socket.disconnect();
  }

  emoji === "" || emoji === undefined ? (emoji = ":vsc:") : emoji;

  try {
    const app = new App({
      signingSecret,
      token,
    });

    console.log("past app creation");

    let status = app.client.users.profile.get().then((res) => {
      return res.profile;
    });

    console.log("past status creation");
    
    const beforeStatus = await status;

    socket.on("updateStatus", (status_text) => {
      console.log("updateStatus");
      try {
        app.client.users.profile.set({
          profile: JSON.stringify({
            status_text,
            status_emoji: emoji,
            status_expiration: 0,
          }),
        });
      } catch (err) {
        console.log("not authed error");
      }
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
      try {
        app.client.users.profile.set({
          profile: JSON.stringify({
            status_text: beforeStatus?.status_text,
            status_emoji: beforeStatus?.status_emoji,
            status_expiration: beforeStatus?.status_expiration,
          }),
        });
      } catch (err) {
        console.log("not authed error, disconnect");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
});

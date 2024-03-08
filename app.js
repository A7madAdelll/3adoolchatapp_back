const { log } = require("console");
const path = require("path");
const mychatapp = require("./routes/mychatapproutes");
const auth = require("./routes/auth");
const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json(), (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/chat3adool", mychatapp);
app.use("/auth", auth);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://3adool:3adooldb@cluster0.kgidsm0.mongodb.net/thechatapp?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((result) => {
    const server = app.listen(8080);
    const io = require("./socket").init(server);
    const socketIdMap = require("./usersmap");
    io.on("connection", (socket) => {
      console.log("Client connected", socket.id, socket.handshake.auth.myid);
      socketIdMap.set(`${socket.handshake.auth.myid}`, socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.handshake.auth.myid);
      socketIdMap.delete(socket.handshake.auth.myid);
    });
  })
  .catch((err) => console.log(err));

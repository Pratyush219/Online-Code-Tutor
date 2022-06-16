const express = require("express");
const app = express();
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

let coordinates = [];
let publicPath = "./public";
app.use(express.static(publicPath));

let server = http.createServer(app);
let io = socketIO(server);
let port = 9999;

let connections = [];
let imageData;
io.on("connection", (socket) => {
    console.log("Number of points = ", coordinates.length);
    console.log(`${socket.id} has connnected`);
    console.log(connections.length);
    if (connections.length > 0) {
        socket.on("request-data", () => {
            console.log(`${socket.id} New connection`);
            io.to(connections[0]).emit("get-data", socket.id);
            
        });
    }
    connections.push(socket.id);
    socket.on("receive-data", (data, dest) => {
        console.log("Receive");
        imageData = data;
        io.to(dest).emit("new-connection", imageData);
    });
    socket.on("draw", (data) => {
        coordinates.push(data);
        // console.log(data.X, data.Y);
        socket.broadcast.emit("onDraw", data.X, data.Y, data.colorVal);
    });
    socket.on("down", (data) => {
        socket.broadcast.emit("onDown", data.X, data.Y);
    });
    socket.on("disconnect", (reason) => {
        connections = connections.filter((con) => con !== socket.id);
        console.log(`${socket.id} has disconnnected`);
    });
});

server.listen(port, (socket) => console.log(`Server started on port ${port}`));

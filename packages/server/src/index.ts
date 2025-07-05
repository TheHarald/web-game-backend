import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { Message } from "@web-game/shared";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

// Routes
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/", (req, res) => {
  res.json({
    message: "Hello from server!",
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}`);
});

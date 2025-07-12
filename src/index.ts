import express, { Application } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app: Application = express();
const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Express + TypeScript + Socket.IO Server");
});

app.get("/api/check", (req, res) => {
  res.json({
    message: "API is working!",
    time: new Date().toISOString(),
  });
});

// Socket.IO connection handler
io.on("connection", (socket: Socket) => {
  console.log("New client connected:", socket.id);

  // Example event
  socket.on("message", (data: string) => {
    console.log("Message received:", data);
    io.emit("message", `Server received: ${data}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

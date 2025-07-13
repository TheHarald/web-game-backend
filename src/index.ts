import express, { Application } from "express";
import cors from "cors";
import { createServer } from "http";
import { defasultErrorHandler } from "./error-handler";
import { initSocket } from "./socket";

const app: Application = express();
const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(defasultErrorHandler);

// Socket
initSocket(httpServer);

// Routes
app.get("/", (req, res) => {
  res.send("Express + TypeScript + Socket.IO Server");
});

app.get("/api/error-check", (req, res) => {
  throw new Error("something went wrong");
});

app.get("/api/check", (req, res) => {
  res.json({
    message: "API is working!",
    time: new Date().toISOString(),
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

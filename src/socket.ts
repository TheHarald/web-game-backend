import { Socket, Server as SocketIOServer } from "socket.io";

export class SocketServer {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.socketEvents();
  }

  private socketEvents(): void {
    // New client connection
    this.io.on("connection", (socket: Socket) => {
      console.log("Client connected:", socket.id);

      // Listen for client messages
      socket.on("message", (data: any) => {
        console.log("Message received:", data);
        this.io.emit("message", data);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }
}

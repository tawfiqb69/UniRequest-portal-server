import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import meRoutes from "./routes/me.js";


const app = express();

// Only our own client website may call this server
app.use(cors({ origin: env.clientUrl }));

// Express 5: without this line, req.body is undefined
app.use(express.json());

// Health check: used to test that the server is alive
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running", data: null });
});

app.use("/api/me", meRoutes);


// Any route that does not exist
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler (it must have 4 parameters, so Express knows it is an error handler)
app.use((err, req, res, next) => {
  // Bad JSON sent by the client is the client's mistake: 400
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  console.error(err.message);
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
});

export default app;
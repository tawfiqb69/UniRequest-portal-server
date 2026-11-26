import app from "./app.js";
import { env } from "./config/env.js";

// Local entry point: starts the server on this computer
app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
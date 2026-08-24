import app from "./app.js";
import env from "./config/env.js";
import {connectDatabase} from "./config/database.js";

const PORT = env.port;

const startServer = async()=>{
  await connectDatabase();

  app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

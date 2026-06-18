import "dotenv/config";

import { app } from "./app.js";
import connectDB from "./src/db/index.js";
connectDB().then(() => {
  app.listen(process.env.PORT || 8000);
});

import * as express from "express";
import * as cors from "cors";
import * as dotenv from 'dotenv';
import { initializeRoutes } from "./routes";

dotenv.config()
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors())

// initializing routes
initializeRoutes(app)

// server start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
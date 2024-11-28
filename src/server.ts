import "dotenv/config";
import express from "express";
import { routes } from "./routes";
import { setupMongo } from "./database";
import cors from "cors";

const app = express();

setupMongo()
  .then(() => {
    app.use(
      cors({
        origin: "*",
      })
    );
    app.use(express.json());
    app.use(routes);

    app.listen(4000, () => console.log(`🚀server is running at port 4000`));
  })
  .catch((err) => {
    console.error(err.message);
  });

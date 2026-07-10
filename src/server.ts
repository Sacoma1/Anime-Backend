import express from "express";
import animeRoutes from "./routes/animeRoutes.js";
import authRoutes from "./routes/authRouts.js";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/animes", animeRoutes);
app.use("/auth", authRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on localhost:${port}`);
});

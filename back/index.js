import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/news", (req, res) => res.json({ ok: true }));
app.get("/", (req, res) => {
  res.send("SCPVB API is running");
});


app.listen(4000, () => console.log("API running on http://localhost:4000"));

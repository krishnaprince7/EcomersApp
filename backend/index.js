import dotenv from "dotenv";
import { app } from "./app.js";   
import { db } from "./config/db.js";

dotenv.config();


db.getConnection((err, connection) => {
  if (err) console.log(" DB Connection Failed:", err.message);
  else {
    console.log(" MySQL Connected Successfully!");
    connection.release();
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Server running at http://0.0.0.0:${PORT}`);
});

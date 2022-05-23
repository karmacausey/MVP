require("dotenv").config();
const express = require("express");
const db = require("./db/conn.js");
const app = express();
app.use(express.static("public"));

app.get("/api/favorites", (_, res) => {
  db.query("SELECT * FROM student").then((data) => {
    res.json(data.rows);
  }).catch((error)=>{
    res.json(error);
  })
});

app.listen(process.env.PORT, () => {
    console.log(`connecting to: ${process.env.DATABASE_URL}`);
    console.log(`listening on Port ${process.env.PORT}`);
  });
  
const express = require("express");
const app = express();
const PORT = 2021;
const cors = require("cors");
const bearerToken = require("express-bearer-token");

app.use(cors());
app.use(bearerToken());
app.use(express.json());

const { db } = require("./config");

db.getConnection((err, connection) => {
  if (err) {
    return console.error("error mysql:", err.message);
  }
  console.log("connection to my sql server:" + connection.threadId);
});

app.get("/", (req, res) => {
  res.status(200).send("<h1>REST API JCWMAH0506</h1>");
});
const { userRouters, movieRouters } = require("./routers");
const { json } = require("express");
app.use("/user", userRouters);
app.use("/movies", movieRouters);

app.use((error, req, res, next) => {
  console.log("Handling error", error);
  res.status(500).send({ status: "error mysql", messages: error });
});

app.listen(PORT, () => `CONNECTED : port ${PORT} `);

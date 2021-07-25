const mysql = require("mysql");
const util = require("util");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "ariefrances",
  database: "backend_2021",
  port: 3306,
  multipleStatements: true,
});

const dbQuery = util.promisify(db.query).bind(db);

module.exports = { db, dbQuery };

const { db, dbQuery, createToken } = require("../config");
const Crypto = require("crypto");

module.exports = {
  get: async (req, res, next) => {
    try {
      let sql = `select m.name,m.release_date,m.release_month,m.release_year,m.duration_min,m.genre,m.description,ms.status,l.location,st.time from schedules s join movies m on s.movie_id = m.id join locations l on l.id = s.location_id join show_times st on s.time_id = st.id join movie_status ms on m.status = ms.id  `;
      let dataMovie = await dbQuery(sql);
      res.status(200).send(dataMovie);
    } catch (error) {
      next(error);
    }
  },
  getCategory: async (req, res, next) => {
    try {
      let { status, location, time } = req.query;
      let getSQL,
        dataSearch = [];
      for (let prop in req.query) {
        if (prop.includes("status")) {
          let a = prop;
          const b = ["status"];
          a = a.replace(new RegExp(b.join("|"), "g"), "ms.status");
          dataSearch.push(`${a} = ${db.escape(req.query[prop])}`);
        } else {
          dataSearch.push(`${prop} = ${db.escape(req.query[prop])}`);
        }
      }

      if (dataSearch.length > 0) {
        getSQL = `select m.name,m.release_date,m.release_month,m.release_year,m.duration_min,m.genre,m.description,ms.status,l.location,st.time from schedules s  
        join movies m on s.movie_id = m.id
        join show_times st on s.time_id = st.id
        join locations l on s.location_id = l.id
        join movie_status ms on m.status = ms.id
        where ${dataSearch.join(" AND ")}`;
      } else {
        getSQL = `select * from movies`;
      }
      dataMovie = await dbQuery(getSQL);
      return res.status(200).send(dataMovie);
    } catch (error) {
      next(error);
    }
  },
  add: async (req, res, next) => {
    let {
      name,
      genre,
      release_date,
      release_month,
      release_year,
      duration_min,
      description,
    } = req.body;
    let dataInsert = {
      name: name,
      genre: genre,
      release_date: release_date,
      release_month: release_month,
      release_year: release_year,
      duration_min: duration_min,
      description: description,
    };
    if (req.user.role === 1 || req.user.role === "admin") {
      sql = `insert into movies set ?`;
    } else {
      res.status(500).send("HANYA ADMIN YANG DAPAT MENGAKSES FITUR INI");
    }
    let dataMovie = await dbQuery(sql, dataInsert);
    sql = `select * from movies where name = ?`;
    dataMovie = await dbQuery(sql, name);
    return res.status(200).send(dataMovie);
  },
  edit: async (req, res, next) => {
    let { status } = req.body;
    let id = req.params.id;
    if (req.user.role === 1) {
      let sql = `update movies set ? where id =?`;
      let dataMovie = await dbQuery(sql, [{ status: status }, id]);
      return res
        .status(200)
        .send({ id: id, message: "status has been changed" });
    } else {
      return res.status(500).send("HANYA ADMIN YANG DAPAT MENGAKSES FITUR INI");
    }
  },
  set: async (req, res, next) => {
    let { location_id, time_id } = req.body;
    let id = req.params.id;
    if (req.user.role === 1) {
      let sql = `insert into schedules (movie_id,location_id,time_id) values (${db.escape(
        req.params.id
      )},${db.escape(location_id)},${db.escape(time_id)})`;
      let dataMovie = await dbQuery(sql);
      return res
        .status(200)
        .send({ id: id, message: "schedules has been added" });
    } else {
      return res.status(500).send("HANYA ADMIN YANG DAPAT MENGAKSES FITUR INI");
    }
  },
};

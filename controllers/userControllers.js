const { db, dbQuery, createToken } = require("../config");
const Crypto = require("crypto");

module.exports = {
  register: async (req, res, next) => {
    try {
      let username1 = req.body.username;
      let password1 = req.body.password;
      let email1 = req.body.email;

      const { username, password, email } = req.body;
      // const strongPassword = new RegExp(
      //   "((?=.[a-z])(?=.[A-Z])(?=.[0-9])(?=.[^A-Za-z0-9])(?=.{6,}))|((?=.[a-z])(?=.[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))"
      // );
      if (username1.length < 6) {
        return res.status(500).send("panjang username minimal 6 huruf");
      } else if (!email1.includes("@")) {
        return res.status(500).send("email yang anda masukan tidak tepat");
      }
      // else if (!strongPassword.test(password1)) {
      //   return res
      //     .status(500)
      //     .send("password harus mengandung symbol,angka, dan huruf");
      // }
      else {
        let d = new Date();
        let uniqueId = d.valueOf();

        let hashPassword = Crypto.createHmac("sha256", "backend$$$")
          .update(req.body.password)
          .digest("hex");

        let insertSQL = `insert into users (uid,username,email,password,role,status) values (${db.escape(
          uniqueId
        )},${db.escape(req.body.username)},${db.escape(
          req.body.email
        )},${db.escape(hashPassword)},${db.escape(2)},${db.escape(1)})`;
        insertSQL = await dbQuery(insertSQL);

        let getUser = await dbQuery(
          `select * from users where id =${insertSQL.insertId}`
        );

        let { id, uid, username, email, password, role, status } = getUser[0];

        let token = createToken({
          id,
          uid,
          username,
          email,
          role,
          status,
        });
        res.status(200).send({ id, uid, username, email, token });
      }
    } catch (error) {
      next(error);
    }
  },
  //-------------LOGIN--------------------------------
  login: async (req, res, next) => {
    try {
      const { user, password } = req.body;

      let hashPassword = Crypto.createHmac("sha256", "backend$$$")
        .update(req.body.password)
        .digest("hex");

      if (!user || !password) {
        return res.status(400).send({ messages: "user not found" });
      }
      let sql = `select * from users where(email = ? or username = ?) and password = ${db.escape(
        hashPassword
      )}`;
      let dataUser = await dbQuery(sql, [user, user]);
      let { id, uid, username, email, role, status } = dataUser[0];
      let token = createToken({ id, uid, username, email, role, status });
      if (dataUser.length) {
        return res.status(200).send({ ...dataUser[0], token });
      }
    } catch (error) {
      console.log(error);
    }
  },
  deactive: async (req, res, next) => {
    try {
      let sql = `select * from users where id = ? `;
      let dataUser = await dbQuery(sql, req.user.id);
      if (dataUser[0].status == 2) {
        return res.status(500).send({
          message: "tidak bisa mengganti status karena sudah tidak aktif",
        });
      } else if (dataUser[0].status === 3) {
        return res.status(500).send({
          message:
            "tidak bisa mengganti status karena akun sudah close atau telah ditutup",
        });
      } else {
        //proses update untuk mengganti status akun user
        sql = `update users set ? where id = ?`;
        dataUser = await dbQuery(sql, [{ status: 2 }, req.user.id]);

        // output nampilin deactive
        sql = `select uid from users where id = ?`;
        dataUser = await dbQuery(sql, req.user.id);
        return res.status(200).send({ ...dataUser[0], status: "deactive" });
      }
    } catch (error) {
      next(error);
    }
  },
  active: async (req, res, next) => {
    try {
      let sql = `select * from users where id = ? `;
      let dataUser = await dbQuery(sql, req.user.id);
      if (dataUser[0].status == 1) {
        return res.status(500).send({
          message: "tidak bisa mengganti status karena sudah aktif",
        });
      } else if (dataUser[0].status === 3) {
        return res.status(500).send({
          message:
            "tidak bisa mengganti status karena akun sudah close atau telah ditutup",
        });
      } else {
        sql = `update users set ? where id = ?`;
        dataUser = await dbQuery(sql, [{ status: 1 }, req.user.id]);

        sql = `select uid from users where id = ?`;
        dataUser = await dbQuery(sql, req.user.id);
        return res.status(200).send({ ...dataUser[0], status: "active" });
      }
    } catch (error) {
      next(error);
    }
  },
  close: async (req, res, next) => {
    try {
      let sql = `select * from users where id = ? `;
      let dataUser = await dbQuery(sql, req.user.id);
      if (dataUser[0].status === 3) {
        return res.status(500).send({
          message:
            "tidak bisa mengganti status karena akun sudah close atau telah ditutup",
        });
      } else {
        sql = `update users set ? where id = ?`;
        dataUser = await dbQuery(sql, [{ status: 3 }, req.user.id]);

        sql = `select uid from users where id = ?`;
        dataUser = await dbQuery(sql, req.user.id);
        return res.status(200).send({ ...dataUser[0], status: "closed" });
      }
    } catch (error) {
      next(error);
    }
  },
};

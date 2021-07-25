const jwt = require("jsonwebtoken");

module.exports = {
  createToken: (payload) => {
    return jwt.sign(payload, "backend$");
  },
  readToken: (req, res, next) => {
    console.log("");
    const token = req.headers.authorization.split(" ")[1];
    if (!token)
      return res.status(406).send({
        error: true,
        detail: "error token",
        message: "token not found",
      });
    jwt.verify(token, "backend$", (err, decoded) => {
      console.log("decoded", decoded);
      if (err) {
        return res.status(401).send("user not authorization");
      }
      req.user = decoded;
      next();
    });
  },
};

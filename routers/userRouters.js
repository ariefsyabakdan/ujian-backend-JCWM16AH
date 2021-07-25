const express = require("express");
const { readToken } = require("../config");
const { userControllers } = require("../controllers");
const router = express.Router();

router.post("/register", userControllers.register);
router.post("/login", userControllers.login);
router.patch("/deactive", readToken, userControllers.deactive);
router.patch("/active", readToken, userControllers.active);
router.patch("/close", readToken, userControllers.close);

module.exports = router;

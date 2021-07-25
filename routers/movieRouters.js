const express = require("express");
const { readToken } = require("../config");
const { movieControllers } = require("../controllers");
const router = express.Router();

router.get("/get/all", movieControllers.get);
router.get("/get", movieControllers.getCategory);
router.post("/add", readToken, movieControllers.add);
router.patch("/edit/:id", readToken, movieControllers.edit);
router.patch("/set/:id", readToken, movieControllers.set);

module.exports = router;

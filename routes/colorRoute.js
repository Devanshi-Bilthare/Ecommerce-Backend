const express = require("express")
const {
  createColor,
  updateColor,
  deleteColor,
  getColor,
  getallColor,
} = require("../controllers/colorCtrl")

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const router = express.Router()

//create color
router.post("/create", authMiddleware, isAdmin, createColor)

//update a color
router.put("/:id", authMiddleware, isAdmin, updateColor)

//Delete color
router.delete("/:id", authMiddleware, isAdmin, deleteColor)

//get single color
router.get("/:id", getColor)

// get all colors 
router.get("/", getallColor)

module.exports = router
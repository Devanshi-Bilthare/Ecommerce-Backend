const express = require("express")
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getallBrand,
} = require("../controllers/brandCtrl")

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const router = express.Router()

//create brand
router.post("/create", authMiddleware, isAdmin, createBrand)

//update brand
router.put("/:id", authMiddleware, isAdmin, updateBrand)

//delete brand
router.delete("/:id", authMiddleware, isAdmin, deleteBrand)

//get single brand
router.get("/:id", getBrand)

//get all brand
router.get("/", getallBrand)

module.exports = router
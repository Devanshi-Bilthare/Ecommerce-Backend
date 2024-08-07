const express = require("express")
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
} = require("../controllers/productCategoryCtrl")


const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const router = express.Router()

//Create Category
router.post("/create", authMiddleware, isAdmin, createCategory)

//update category
router.put("/:id", authMiddleware, isAdmin, updateCategory)

//delete Category
router.delete("/:id", authMiddleware, isAdmin, deleteCategory)

//get a single category
router.get("/:id", getCategory)

//get all categories
router.get("/", getallCategory)

module.exports = router
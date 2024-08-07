const express = require("express")
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
} = require("../controllers/blogCategoryCtrl")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const router = express.Router()

//create a blog category
router.post("/create", authMiddleware, isAdmin, createCategory)

//update a blog category
router.put("/:id", authMiddleware, isAdmin, updateCategory)

//delete a blog category
router.delete("/:id", authMiddleware, isAdmin, deleteCategory)

//get a single category
router.get("/:id", getCategory)

//get all category
router.get("/", getallCategory)

module.exports = router
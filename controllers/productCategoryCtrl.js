const Category = require("../models/productCategoryModel.js")
const asyncHandler = require("express-async-handler")
const validateMongoDbId = require("../utils/validatemongoid.js")

//create category
const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await Category.create(req.body)
    res.json(newCategory)
  } catch (err) {
    throw new Error(err)
  }
})

//update category
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    })
    res.json(updatedCategory)
  } catch (err) {
    throw new Error(err)
  }
})

// delete category 
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  try {
    const deletedCategory = await Category.findByIdAndDelete(id)
    res.json(deletedCategory)
  } catch (err) {
    throw new Error(err)
  }
})

// get a single ctegory 
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  try {
    const getaCategory = await Category.findById(id)
    res.json(getaCategory)
  } catch (err) {
    throw new Error(err)
  }
})


// get all categories 
const getallCategory = asyncHandler(async (req, res) => {
  try {
    const getallCategory = await Category.find()
    res.json(getallCategory)
  } catch (err) {
    throw new Error(err)
  }
})
module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
}
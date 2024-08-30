// const { query } = require('express')
const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const User = require('../models/userModel')
const validateMongoDbId = require('../utils/validatemongoid')

// create a product 
const createProduct = asyncHandler(async(req,res,next)=>{
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title)
        }
        // console.log(req.body)
        const newProduct =  await Product.create(req.body)
        res.json(newProduct)
    }catch(err){
        throw new Error(err)
    }
})


// upadte a product
const updateProduct = asyncHandler(async(req,res,next)=>{
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title)
        }
        const {id} = req.params
        const updatedProduct =  await Product.findByIdAndUpdate(id,req.body,{new:true})
        res.json(updatedProduct)
    }catch(err){
        throw new Error(err)
    }
})


// delete a product 
const deleteProduct = asyncHandler(async(req,res,next)=>{
    try{
        const {id} = req.params
        const deletedProduct =  await Product.findByIdAndDelete(id)
        res.json(deletedProduct)
    }catch(err){
        throw new Error(err)
    }
})

// get a single product 
const getSingleProduct = asyncHandler(async(req,res,next)=>{
    try{
        const {id} = req.params
        const findProduct =  await Product.findById(id).populate("color")
        res.json(findProduct)
    }catch(err){
        throw new Error(err)
    }
})

//get all products
const getAllProducts = asyncHandler(async(req,res,next)=>{
    try{
        // Filtering
        const queryObject = {...req.query}
        const excludeFields = ['page','sort','limit','fields']
        excludeFields.forEach((el) => delete queryObject[el])
        let queryStr = JSON.stringify(queryObject)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,(match) => `$${match}`)
        let query = Product.find(JSON.parse(queryStr))

        // Sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(" ")
            query = query.sort(sortBy)
        }else{
            query = query.sort('-createdAt')
        }

        //limiting the fields
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ")
            query = query.select(fields)   
        }else{
            query = query.select('-__v')
        }

        //pagination
        const page = req.query.page
        const limit = req.query.limit
        const skip = (page - 1) * limit
        query = query.skip(skip).limit(limit)
        if(req.query.page){
            const productCount = await Product.countDocuments()
            if(skip >= productCount) throw new Error('This Page Does Not Exists')
        }
        const product =  await query
        res.json(product)
    }catch(err){
        throw new Error(err)
    }
})

// add and remove from wish list
const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { prodId } = req.body
    try {
      const user = await User.findById(_id)
      const alreadyadded = user.wishList.find((id) => id.toString() === prodId)
      if (alreadyadded) {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $pull: { wishList: prodId },
          },
          {
            new: true,
          }
        )
        res.json(user)
      } else {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $push: { wishList: prodId },
          },
          {
            new: true,
          }
        )
        res.json(user)
      }
    } catch (error) {
      throw new Error(error)
    }
  })


//get ratings and average ratings
const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment , prodId} = req.body.data;
  try {
    const product = await Product.findById(prodId);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user has already rated the product
    let alreadyRated = product.ratings.find(
      (rating) => rating.postedby.toString() === _id.toString()
    );

    if (alreadyRated) {
      // Update existing rating
      await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      // Add a new rating
      await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star,
              comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }

    // Recalculate the product's overall rating
    const updatedProduct = await Product.findById(prodId);
    const totalRating = updatedProduct.ratings.length;
    const ratingSum = updatedProduct.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    const actualRating = Math.round(ratingSum / totalRating);

    // Update the product's total rating
    const finalProduct = await Product.findByIdAndUpdate(
      prodId,
      { totalrating: actualRating },
      { new: true }
    ).populate('ratings.postedby')

    // Return the updated product
    res.json(finalProduct);
  } catch (error) {
    // Return a 500 status code with the error message
    res.status(500).json({ message: error.message });
  }
});


module.exports = {
    createProduct,
    getSingleProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
}
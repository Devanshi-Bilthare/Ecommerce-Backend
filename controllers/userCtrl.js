const { generateToken } = require('../config/jwtToken')
const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')
const asyncHandler = require('express-async-handler')
const validateMongoDbId = require('../utils/validatemongoid')
const { generateRefreshToken } = require('../config/refreshToken')
const jwt = require('jsonwebtoken')
const sendMail = require('../controllers/emailCtrl')
const crypto = require('crypto')
const uniqid = require('uniqid')

// create user
const createUser =asyncHandler( async(req,res)=>{
    const {email} = req.body
    const findUser = await User.findOne({email})
    if(!findUser){
        const newUser =await User.create(req.body)
        res.json(newUser)
    }else{
        throw new Error('User ALready Exists')
    }
})


// login User
const loginUserCtrl = asyncHandler(async(req,res)=>{
    const {email,password} = req.body
    // check if user exists or not
    const findUser = await User.findOne({email})
    if(findUser && await findUser.isPasswordMatched(password)){
        const refreshToken = await generateRefreshToken(findUser._id)
        const updateUser = await User.findOneAndUpdate(findUser._id,{refreshToken},{new:true})
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            maxAge : 72 * 60 * 60 * 1000
        })
        res.json({
            _id:findUser._id,
            firstname:findUser.firstname,
            lastname:findUser.lastname,
            email:findUser.email,
            mobile:findUser.mobile,
            token:generateToken(findUser._id)
        })
    }else{
        throw new Error('Invalid credientials')
    }
})


// login Admin
const loginAdmin = asyncHandler(async(req,res)=>{
    const {email,password} = req.body
    // check if user exists or not
    const findAdmin = await User.findOne({email})
    if(findAdmin.role !== 'admin') throw new Error('Not Authorised')
    if(findAdmin && await findAdmin.isPasswordMatched(password)){
        const refreshToken = await generateRefreshToken(findAdmin._id)
        const updateUser = await User.findOneAndUpdate(findAdmin._id,{refreshToken},{new:true})
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            maxAge : 72 * 60 * 60 * 1000
        })
        res.json({
            _id:findAdmin._id,
            firstname:findAdmin.firstname,
            lastname:findAdmin.lastname,
            email:findAdmin.email,
            mobile:findAdmin.mobile,
            token:generateToken(findAdmin._id)
        })
    }else{
        throw new Error('Invalid credientials')
    }
})

// handle refresh token
const handleRefreshToken = asyncHandler(async(req,res)=>{
    const cookie= req.cookies
    if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({refreshToken})
    if(!user){
        throw new Error("No Refresh Token Present in db or not matched")
    }
    jwt.verify(refreshToken,process.env.JWT_SECRET,(err,decoded) => {
        if(err || user.id !== decoded.id){
            throw new Error('there is soemthing wrong with refresh token')
        }
        const accessToken = generateToken(user?._id)
        res.json({accessToken})
    }) 
    res.json(user)
})

//logout

const logout = asyncHandler(async(req,res)=>{
    const cookie= req.cookies
    if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({refreshToken})
    if(!user){
        res.clearCookie('refreshToken',{
            httpOnly:true,
            secure:true
        })
        return res.sendStatus(204)// forbidden
    }
    user.refreshToken = ""
    await user.save()

    console.log(user)
    res.clearCookie('refreshToken',{
        httpOnly:true,
        secure:true
    })
    return res.sendStatus(204)// forbidden
})

//update a user
const updateUser = asyncHandler(async(req,res)=>{
    try{
        const {_id}  = req.user
        validateMongoDbId(_id)
        // console.log(req.user)
        const {firstname,lastname,email,mobile} = req.body
        const updatedUser = await User.findByIdAndUpdate(_id,{
            firstname,
            lastname,
            email,
            mobile
        },{
            new :true
        })

        console.log(updatedUser)
        res.json(updatedUser)
       }catch(err){
        throw new Error(err)
       }
})

// save user Address 
const saveAddress = asyncHandler(async(req,res)=>{
    try{
        const {_id}  = req.user
        validateMongoDbId(_id)
        // console.log(req.user)
        const {address} = req.body
        const updatedAddress = await User.findByIdAndUpdate(_id,{
            address,
        },{
            new :true
        })
        res.json(updatedAddress)
       }catch(err){
        throw new Error(err)
       }
})


// get all User
const getAllUser = asyncHandler(async(req,res)=>{
   try{
    const allUsers = await User.find()
    res.json(allUsers)
   }catch(err){
    throw new Error(err)
   }
    
})

// get a single user
const getSingleUser = asyncHandler(async(req,res)=>{
    try{
     const {id} = req.params
     validateMongoDbId(id)
     const user = await User.findById(id)
     res.json(user)
    }catch(err){
     throw new Error(err)
    }  
 })

 //delete a user

 const deleteUser = asyncHandler(async(req,res)=>{
    try{
     const {id} = req.params
     validateMongoDbId(id)
     const user = await User.findByIdAndDelete(id)
     res.json(user)
    }catch(err){
     throw new Error(err)
    }  
 })

 const blockUser = asyncHandler(async(req,res)=>{
    try{
     const {id} = req.params
     validateMongoDbId(id)
     const user = await User.findByIdAndUpdate(id,{
        isBlocked:true
     },{
        new:true
     })
     res.json({
        message:"user Blocked"
     })
    }catch(err){
     throw new Error(err)
    }  
 })

 const unBlockUser = asyncHandler(async(req,res)=>{
    try{
     const {id} = req.params
     validateMongoDbId(id)
     const user = await User.findByIdAndUpdate(id,{
        isBlocked:false
     },{
        new:true
     })
     res.json({
        message:"User Unblocked"
     })
    }catch(err){
     throw new Error(err)
    }  
 })

const updatePassword = asyncHandler(async (req,res)=>{
    const {_id} = req.user
    console.log(_id)
    const {password} = req.body
    validateMongoDbId(_id)
    const user = await User.findById(_id)
    if(password){
        user.password = password
        await user.save()
    }
    res.json(user)
    
})

const forgotPasswordToken = asyncHandler(async (req,res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user) throw new Error('User  with this email does not exists')
    try{
        const token = await user.createPasswordResetToken()
        await user.save()
        const resetUrl = `Hi please follow this link to reset your password. This link is valid till 10 mins from now. <a href='http://localhost:3000/reset-password/${token}'>Click Here</a>` 

        const data = {
            to:email,
            subject:'Forgot password link',
            html:resetUrl,
            text:'Hey User'
        }
        sendMail(data,req,res)
        res.json(token)
        }catch(err){
        throw new Error(err)
    }
    
})

const resetPassword = asyncHandler(async (req,res)=>{
    const {password} = req.body
    const {token} = req.params
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({passwordResetToken:hashedToken,
        passwordExpires:{$gt:Date.now()}
    })
    if(!user) throw new Error("Token Expired, Please try again")

    user.password = password
    user.passwordResetToken = undefined
    user.passwordExpires = undefined

    user.save()
    res.json({user})   
})

const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user
    try {
      const findUser = await User.findById(_id).populate("wishList")
      res.json(findUser)
    } catch (error) {
      throw new Error(error)
    }
  })

// Add Item To Cart
  const userCart = asyncHandler(async (req, res) => {
    const { productId, color, quantity,price } = req.body
    const { _id } = req.user
    validateMongoDbId(_id)
    try {  
      let newCart = await new Cart({
        userId:_id,
        productId,
        color,
        price,
        quantity
      }).save()
      res.json(newCart)
    } catch (error) {
      throw new Error(error)
    }
  })


  // get user Cart
  const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user
    validateMongoDbId(_id)
    try {
      const cart = await Cart.find({ userId: _id }).populate(
        "productId"
      ).populate("color")
      res.json(cart)
    } catch (error) {
      throw new Error(error)
    }
  })

  const removeFromCart = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const {id} = req.params
    validateMongoDbId(_id)
    try {
     const deletedProductFromCart = await Cart.deleteOne({userId:_id,productId:id})
      res.json(deletedProductFromCart)
    } catch (error) {
      throw new Error(error)
    }
  })

  const updateProductQuantityFromCart = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const {id,newQuantity} = req.body
    validateMongoDbId(_id)
    try {
     const cartItem = await Cart.findOne({userId:_id,productId:id})
     cartItem.quantity = newQuantity
     await cartItem.save()
      res.json(cartItem)
    } catch (error) {
      throw new Error(error)
    }
  })

  const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const {shippingInfo,orderItems,totalPrice,totalPriceAfterDiscount,paymentInfo} = req.body
    try {
     const order = await Order.create({shippingInfo,orderItems,totalPrice,totalPriceAfterDiscount,paymentInfo,user:_id})

     return res.json(order)
    } catch (error) {
      throw new Error(error)
    }
  })
  


//   const emptyCart = asyncHandler(async (req, res) => {
//     const { _id } = req.user
//     validateMongoDbId(_id)
//     try {
//       const user = await User.findOne({ _id })
//       const cart = await Cart.findOneAndDelete({ orderby: user._id })
//       res.json(cart)
//     } catch (error) {
//       throw new Error(error)
//     }
//   })

//   // apply coupon
//   const applyCoupon = asyncHandler(async (req, res) => {
//     const { coupon } = req.body
//     const { _id } = req.user
//     validateMongoDbId(_id)
//     const validCoupon = await Coupon.findOne({ name: coupon })
//     if (validCoupon === null) {
//       throw new Error("Invalid Coupon")
//     }
//     const user = await User.findOne({ _id })
//     let { cartTotal } = await Cart.findOne({
//       orderby: user._id,
//     }).populate("products.product")
//     let totalAfterDiscount = (
//       cartTotal -
//       (cartTotal * validCoupon.discount) / 100
//     ).toFixed(2)
//     await Cart.findOneAndUpdate(
//       { orderby: user._id },
//       { totalAfterDiscount },
//       { new: true }
//     )
//     res.json(totalAfterDiscount)
//   })
  
  //get MY orders
const getMyOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      const orders = await Order.find({user:_id}).populate('user').populate('orderItems.product').populate('orderItems.color')
      res.json(orders);
    } catch (error) {
      throw new Error(error);
    }
  }); 

  const monthWiseOrderDetails = asyncHandler(async (req, res) => {
    let d = new Date();
    d.setDate(1); 
    d.setMonth(d.getMonth() - 11);
    let startDate = d;
  
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $lte: new Date(), 
            $gte: startDate   
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },   
            year: { $year: "$createdAt" }      
          },
          amount: {
            $sum: "$totalPriceAfterDiscount"
          },
          count: {
            $sum: 1 
          }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
      }
    ]);
    res.json(data);
  });



  const yearlyOrderCount = asyncHandler(async (req, res) => {
    const data = await Order.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" } }, // Extract year from createdAt
          count: { $sum: 1 } ,
          amount: {
            $sum: "$totalPriceAfterDiscount"
          }
        }
      },
      {
        $sort: { "_id.year": 1 } // Sort by year
      }
    ]);
  
    res.json(data);
  });
  
  

//   const getAllOrders = asyncHandler(async (req, res) => {
//     try {
//       const userorders = await Order.find()
//         .populate("products.product")
//         .populate("orderby")
//         .exec();
//       res.json(userorders);
//     } catch (error) {
//       throw new Error(error);
//     }
//   }); 

//   //get  orders by user Id
//   const getOrderByUserId = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     validateMongoDbId(_id);
//     try {
//       const userorders = await Order.findOne({orderby:id})
//         .populate("products.product")
//         .populate("orderby")
//         .exec();
//       res.json(userorders);
//     } catch (error) {
//       throw new Error(error);
//     }
//   }); 

// //   update order status 
//   const updateOrderStatus = asyncHandler(async (req, res) => {
//     const { status } = req.body;
//     const { id } = req.params;
//     validateMongoDbId(id);
//     try {
//       const updateOrderStatus = await Order.findByIdAndUpdate(
//         id,
//         {
//           orderStatus: status,
//           paymentIntent: {
//             status: status,
//           },
//         },
//         { new: true }
//       );
//       res.json(updateOrderStatus);
//     } catch (error) {
//       throw new Error(error);
//     }
//   });

module.exports = {
    createUser,
    loginUserCtrl,
    getAllUser,
    getSingleUser,
    deleteUser,
    updateUser,
    blockUser,
    unBlockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    // emptyCart,
    // applyCoupon,
    createOrder,
    getMyOrders,
    // getAllOrders,
    // getOrderByUserId,
    // updateOrderStatus,
    removeFromCart,
    updateProductQuantityFromCart,
    monthWiseOrderDetails,
    yearlyOrderCount
}
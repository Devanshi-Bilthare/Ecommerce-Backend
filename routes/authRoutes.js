const express = require('express')
const {createUser,loginUserCtrl, getAllUser, getSingleUser, deleteUser, updateUser, blockUser, unBlockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdmin, getWishlist, saveAddress, userCart, getUserCart, createOrder, removeFromCart, updateProductQuantityFromCart, getMyOrders, yearlyOrderCount, monthWiseOrderDetails} = require('../controllers/userCtrl')
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware')
const { checkout, paymentVerification } = require('../controllers/paymentCtrl')
const router = express.Router()

//register
router.post('/register',createUser)

//forgot password
router.post('/forgot-password-token',forgotPasswordToken)

//Reset password
router.put('/reset-password/:token',resetPassword)

// update order status 
// router.put('/order/update-order/:id',authMiddleware,isAdmin,updateOrderStatus)

//login User
router.post('/login',loginUserCtrl)

//login Admin
router.post('/login-admin',loginAdmin)

router.get('/getMonthWiseOrderDetails',authMiddleware,monthWiseOrderDetails)
router.get('/getYearlyTotalOrders',authMiddleware,yearlyOrderCount)

// Add Item To Cart 
router.post('/cart',authMiddleware,userCart)

//Apply Coupon
// router.post('/cart/apply-coupon',authMiddleware,applyCoupon)

// create order 
router.post('/cart/create-order',authMiddleware,createOrder)

//get the cart
router.get('/cart',authMiddleware,getUserCart)

router.post('/order/checkout',authMiddleware,checkout)
router.post('/order/paymentVerification',authMiddleware,paymentVerification)

// empty the cart
// router.delete('/empty-cart',authMiddleware,emptyCart)

// delete product from cart
router.delete('/delete-product-cart/:id',authMiddleware,removeFromCart)

router.post("/update-product-cart/",authMiddleware,updateProductQuantityFromCart)

//handle refresh token
router.get('/refresh',handleRefreshToken)

//logout
router.get('/logout',logout)

//get wish list
router.get('/wishlist',authMiddleware,getWishlist)

//update a User
router.put('/edit',authMiddleware,updateUser)

//update user Address
router.put('/save-address',authMiddleware,saveAddress)

//block the user
router.put('/block/:id',authMiddleware,isAdmin,blockUser)


//unblock the user
router.put('/unblock/:id',authMiddleware,isAdmin,unBlockUser)


//get all the users
router.get('/all-users',getAllUser)

//get user orders
router.get('/getmyorders',authMiddleware,getMyOrders)

//get all orders
// router.get('/getallorders',authMiddleware,isAdmin,getAllOrders)

//get orders by user Id
// router.post('/getorderbyuser/:id',authMiddleware,isAdmin,getOrders)


// get single user
router.get('/:id',authMiddleware,isAdmin,getSingleUser)

//delete a user
router.delete('/:id',deleteUser)

// update password 
router.put('/password',authMiddleware,updatePassword)




module.exports = router
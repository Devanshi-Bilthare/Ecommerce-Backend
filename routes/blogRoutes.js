const express = require('express')
const { createBlog, updateBlog, getBlog, getAllBlog, deleteBlog, likeBlog, dislikeBlog } = require('../controllers/blogCtrl')
const router = express.Router()
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware')
const { blogImgResize, uploadPhoto } = require('../middlewares/uploadImage')
const { uploadImages } = require('../controllers/blogCtrl')

// create a blog 
router.post('/create',authMiddleware,isAdmin,createBlog)

router.put('/upload/:id',authMiddleware,isAdmin,uploadPhoto.array('images',2),blogImgResize,uploadImages)

//like a blog
router.put("/likes", authMiddleware, likeBlog)

//dislike a blog
router.put("/dislikes", authMiddleware, dislikeBlog)

// update Blog 
router.put('/:id',authMiddleware,isAdmin,updateBlog)

// get single blog
router.get('/:id',getBlog)

//get all blogs
router.get('/',getAllBlog)

//delete Blog
router.delete('/:id',authMiddleware,isAdmin,deleteBlog)







module.exports = router

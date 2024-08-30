const express = require('express')
const {uploadImages, DeleteImages } = require('../controllers/uploadControllers')
const { authMiddleware,isAdmin } = require('../middlewares/authMiddleware')
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImage')
const router = express.Router()


//upload a product image
// router.post('/',authMiddleware,uploadPhoto.array('images',10),productImgResize,uploadImages)

router.post('/',authMiddleware,isAdmin,uploadImages)

//Delete a product image
router.delete('/delete-img/:id',authMiddleware,isAdmin,DeleteImages)

module.exports = router
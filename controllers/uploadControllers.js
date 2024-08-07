const {cloudinaryUploadImg,cloudinaryDeleteImg} = require('../utils/cloudinary')
const fs = require('fs')
const asyncHandler = require('express-async-handler')
  
//upload Images
const uploadImages =  asyncHandler(async(req,res,next)=>{
    try{
        const uploader = (path)=> cloudinaryUploadImg(path,'images')
        const urls = []
        const files = req.files
        for(const file of files){
            const {path} = file
            const newpath = await uploader(path)
            urls.push(newpath)
            fs.unlinkSync(path)
        }
        const images = urls.map(file => {return file})
        res.json({images})
    }catch(err){
        throw new Error(err)
    }
})

//delete Images
const DeleteImages =  asyncHandler(async(req,res,next)=>{
  const {id} = req.params
  try{
      const uploader = cloudinaryDeleteImg(id,'images')
      res.json({message:"deleted"})
      
  }catch(err){
      throw new Error(err)
  }
})

module.exports  ={
    uploadImages,
    DeleteImages
}
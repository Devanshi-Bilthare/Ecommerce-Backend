const nodemailer = require('nodemailer')
const asyncHandler = require('express-async-handler')

const sendMail = asyncHandler((data,req,res)=>{
    const transport = nodemailer.createTransport({
        service:'gmail',
        host:'smtp.gmail.com',
        post:465,
        auth:{
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASSWORD  
        }
    })

    const info =transport.sendMail( {
        from:"Ecommerce <abc@gmail.com>",
        to:data.to,
        subject:data.subject,
        text:data.text,
        html:data.html
    })

    console.log('message ',info.messageId)

    console.log("preview URL",nodemailer.getTestMessageUrl(info))
})

module.exports =sendMail
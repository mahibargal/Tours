const nodemailer = require('nodemailer')

const sendEmail = async(options)=>{
    //1 create transporter(service like gmail)

    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })

    //2 define email options
    const mailOptions = {
        from:'Mahesh Bargal <hello@mahesh.com>',
        to:options.email,
        subject:options.subject,
        text:options.message
        // html
    }

    //3 send the email
  await  transporter.sendMail(mailOptions); 
}

module.exports = sendEmail

// send email with gmail
// const transporter = nodemailer.createTransport({
//     service:'Gmail',
//     auth:{
//         user:'',
//         pass:''
//     }
//     //activate in gamial " less secure app option"   (sendGrin Mailgrain)
// })
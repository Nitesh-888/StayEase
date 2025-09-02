import nodemailer from "nodemailer";
import ejs from 'ejs';

const sendMail = async (info) => {
    console.log(info);
    const htmlToSend=await ejs.renderFile('views/users/email.ejs', {info});
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });
    transporter.sendMail({
        from: `StayEase <${process.env.EMAIL}>`,
        to: info.email,
        subject: 'Verify Your Account',
        html: htmlToSend
    }, 
    (error, info) => {
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    })
};
export default sendMail;

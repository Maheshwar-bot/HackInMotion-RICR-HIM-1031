const nodemailer = require("nodemailer");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"MediMitra" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "MediMitra - Email Verification OTP",
    text: `Your MediMitra verification OTP is ${otp}. It expires in 10 minutes.`,
  });
};

module.exports = {
  sendOTPEmail,
};
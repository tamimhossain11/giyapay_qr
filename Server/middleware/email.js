import nodemailer from "nodemailer";

// Create transporter for Mailtrap
const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "api", // Your Mailtrap username
    pass: "2a888524873fae75d036e625fae1bc36", // Your Mailtrap password
  },
});

export default transporter;

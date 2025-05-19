export const sendEmail = async ({ to, subject, text }) => {
  // Create a transporter using your email service credentials (e.g., Gmail, SendGrid)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or App Password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email
    to, // Receiver's email
    subject,
    text, // Email content
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

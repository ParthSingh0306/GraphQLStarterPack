import nodemailer from "nodemailer";

interface MailPayload {
  password: string;
  userId: string;
  email: string;
}

class MailService {
  public static sendMail(payload: MailPayload) {
    const { email, userId, password } = payload;
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "7e40a6ca77d94e",
        pass: "2eeea192f495ab",
      },
    });

    const mailOptions = {
      from: "parth@parth.ai",
      to: email,
      subject: "Test Email",
      html: `<p>${userId} - ${email} - ${password}</p>`,
    };

    return transporter.sendMail(mailOptions);
  }
}

export default MailService;

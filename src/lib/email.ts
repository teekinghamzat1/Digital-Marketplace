import nodemailer from "nodemailer";
import prisma from "./prisma";

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from"]
        }
      }
    });

    const config: Record<string, string> = {};
    settings.forEach(s => { config[s.key] = s.value; });

    if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
      console.warn("SMTP not configured. Email not sent.");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: parseInt(config.smtp_port) || 587,
      secure: config.smtp_port === "465",
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass,
      },
    });

    await transporter.sendMail({
      from: `"${config.smtp_from || "Marketplace"}" <${config.smtp_user}>`,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Email Sending Error:", error);
    return { success: false, error };
  }
}

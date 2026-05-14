import { Resend } from 'resend';
import prisma from "./prisma";
import { logger } from "./logger";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    // Optionally fetch a custom sender from settings, or use a default one like "onboarding@resend.dev" for testing
    // Make sure you have verified your domain on Resend.com to use a custom sender email.
    let senderEmail = "Marketplace <onboarding@resend.dev>"; 
    
    try {
      const smtpFromSetting = await prisma.siteSetting.findUnique({
        where: { key: "smtp_from" }
      });
      if (smtpFromSetting?.value) {
        // e.g. "Marketplace <no-reply@yourdomain.com>"
        senderEmail = smtpFromSetting.value;
      }
    } catch (dbErr) {
      // Ignore DB errors if settings are not available
    }

    if (!process.env.RESEND_API_KEY) {
      logger.warn("RESEND_API_KEY is not set. Email not sent.");
      return { success: false, error: "RESEND_API_KEY is not configured" };
    }

    const data = await resend.emails.send({
      from: senderEmail,
      to: [to],
      subject: subject,
      html: html,
    });

    if (data.error) {
      logger.error(data.error, "Resend API Error");
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (error) {
    logger.error(error, "Email Sending Error");
    return { success: false, error };
  }
}

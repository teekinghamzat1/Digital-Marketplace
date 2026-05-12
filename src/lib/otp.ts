import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { authenticator } = require("otplib");

import QRCode from "qrcode";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.OTP_ENCRYPTION_KEY || "your-32-char-encryption-key-here";
const IV_LENGTH = 16;

/**
 * Encrypts the OTP secret for secure storage in the database.
 */
export function encryptSecret(secret: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(secret);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Decrypts the OTP secret for verification.
 */
export function decryptSecret(encryptedSecret: string): string {
  const textParts = encryptedSecret.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * Generates a new TOTP secret and QR code for an admin.
 */
export async function generateOTPSetup(email: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, "DigitalMarketplace", secret);
  const qrCodeUrl = await QRCode.toDataURL(otpauth);
  
  return { secret, qrCodeUrl };
}

/**
 * Verifies a submitted OTP code.
 */
export function verifyOTP(token: string, secret: string): boolean {
  return authenticator.check(token, secret);
}

import validator from 'validator';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// -----------------------------------------------------------------------------
// Google APIs Authentication
// -----------------------------------------------------------------------------
function getGoogleAuth() {
    // Escape formatted newlines in private key
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
        ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : '';

    return new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets']
    );
}

// -----------------------------------------------------------------------------
// API Handler for Contact Form
// -----------------------------------------------------------------------------
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // -- Validate & Sanitize Input --
        let { name, email, phone, subject, message } = req.body;

        // Basic required checks
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        // Sanitize text inputs
        name = validator.escape(name.trim());
        email = validator.normalizeEmail(email);
        phone = phone ? validator.escape(phone.trim()) : '';
        subject = subject ? validator.escape(subject.trim()) : '';
        message = validator.escape(message.trim());

        // -- Google Auth --
        const auth = getGoogleAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        // -- Append Data to Google Sheets --
        if (process.env.GOOGLE_CONTACT_SHEET_ID) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_CONTACT_SHEET_ID,
                range: 'Sheet1!A:F', // Adjust based on actual sheet name if needed
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [
                        [
                            new Date().toISOString(), // Timestamp
                            name,
                            email,
                            phone,
                            subject,
                            message
                        ]
                    ]
                }
            });
        } else {
            console.warn("GOOGLE_CONTACT_SHEET_ID is not set. Data was not saved to Google Sheets.");
        }

        // -- Send Notification Emails (Nodemailer) --
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            // Contact Confirmation Email to User
            await transporter.sendMail({
                from: `"LawWise Team" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Message Received — LawWise Nyai AI',
                html: `<p>Hi ${name},</p><p>Thank you for reaching out to us. We have received your message regarding <strong>${subject || 'your inquiry'}</strong>.</p><p>Our team will review it and get back to you shortly.</p><br><p>Best,</p><p>LawWise Team</p>`
            });

            // Contact Notification Email to Company
            if (process.env.COMPANY_EMAIL) {
                await transporter.sendMail({
                    from: `"LawWise Website" <${process.env.SMTP_USER}>`,
                    to: process.env.COMPANY_EMAIL,
                    subject: `New Contact Form Submission: ${name}`,
                    text: `New contact message received!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\n\nMessage:\n${message}`
                });
            }
        }

        return res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error("Contact Error:", error);
        return res.status(500).json({ success: false, error: error.message || 'An internal server error occurred' });
    }
}

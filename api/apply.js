import multer from 'multer';
import validator from 'validator';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { Readable } from 'stream';

// -----------------------------------------------------------------------------
// 1. Multer Configuration (Memory Storage for direct upload to Google Drive)
// -----------------------------------------------------------------------------
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
        }
    }
}).single('resume');

// -----------------------------------------------------------------------------
// 2. Google APIs Authentication
//    Note: Requires GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY
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
        ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/spreadsheets']
    );
}

// -----------------------------------------------------------------------------
// 3. Vercel Serverless Utilities
// -----------------------------------------------------------------------------
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
};

export const config = {
    api: {
        bodyParser: false, // Disallow Vercel body parsing so multer can handle the file
    },
};

// -----------------------------------------------------------------------------
// 4. API Handler
// -----------------------------------------------------------------------------
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await runMiddleware(req, res, upload);

        // -- Validate & Sanitize Input --
        let { name, email, phone, role, linkedin, portfolio, motivation } = req.body;

        // Basic required checks
        if (!name || !email || !role || !motivation) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Resume file is required' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        // Sanitize text inputs
        name = validator.escape(name.trim());
        email = validator.normalizeEmail(email);
        phone = phone ? validator.escape(phone.trim()) : '';
        role = validator.escape(role.trim());
        linkedin = linkedin && validator.isURL(linkedin) ? linkedin.trim() : '';
        portfolio = portfolio && validator.isURL(portfolio) ? portfolio.trim() : '';
        motivation = validator.escape(motivation.trim());

        // -- Google Auth --
        const auth = getGoogleAuth();
        const drive = google.drive({ version: 'v3', auth });
        const sheets = google.sheets({ version: 'v4', auth });

        // -- 1. Upload file to Google Drive --
        const fileStream = new Readable();
        fileStream.push(req.file.buffer);
        fileStream.push(null);

        const driveRes = await drive.files.create({
            requestBody: {
                name: `[${role}] ${name} - Resume`,
                if(!process.env.GOOGLE_DRIVE_FOLDER_ID) {
                    throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set");
    }

const driveRes = await drive.files.create({
        requestBody: {
            name: `[${role}] ${name} - Resume`,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        },
        media: {
            mimeType: req.file.mimetype,
            body: fileStream,
        },
        fields: "id, webViewLink"
    });
},
media: {
    mimeType: req.file.mimetype,
        body: fileStream,
            },
fields: 'id, webViewLink'
        });

const resumeLink = driveRes.data.webViewLink || 'Unlinked File Uploaded';

// -- 2. Append Data to Google Sheets --
if (process.env.GOOGLE_SHEET_ID) {
    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Sheet1!A:H', // Adjust based on your actual sheet name
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [
                [
                    new Date().toISOString(), // Timestamp
                    name,
                    email,
                    phone,
                    role,
                    linkedin,
                    portfolio,
                    motivation,
                    resumeLink
                ]
            ]
        }
    });
}

// -- 3. Send Notification Emails (Nodemailer) --
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

    // Applicant Confirmation Email
    await transporter.sendMail({
        from: `"LawWise Careers" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Application Received — LawWise Nyai AI',
        html: `<p>Hi ${name},</p><p>Thank you for applying for the <strong>${role}</strong> position at LawWise Nyai AI.</p><p>We have successfully received your application and resume. Our team will review your application and respond within 5-7 business days.</p><br><p>Best,</p><p>LawWise Team</p>`
    });

    // Company Notification Email
    if (process.env.COMPANY_EMAIL) {
        await transporter.sendMail({
            from: `"LawWise Careers" <${process.env.SMTP_USER}>`,
            to: process.env.COMPANY_EMAIL,
            subject: `New Application: ${name} for ${role}`,
            text: `New application received!\n\nName: ${name}\nEmail: ${email}\nRole: ${role}\nResume: ${resumeLink}\nMotivation: ${motivation}`
        });
    }
}

return res.status(200).json({ success: true, message: 'Application submitted successfully' });

    } catch (error) {
    console.error("Apply Error:", error);
    return res.status(500).json({ success: false, error: error.message || 'An internal server error occurred' });
}
}

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: { error: 'För många förfrågningar. Försök igen om 15 minuter.' }
});

// reCAPTCHA verification function
async function verifyRecaptcha(token) {
  // Skip reCAPTCHA verification if no secret key is set (development mode)
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not set - skipping verification');
    return true; // Allow in development
  }

  if (!token) {
    console.warn('No reCAPTCHA token provided');
    return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`
    });

    const data = await response.json();
    console.log('reCAPTCHA verification result:', data);
    return data.success && (data.score === undefined || data.score > 0.5); // Handle both v2 and v3
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
}

// Email transporter setup
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Contact form endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    console.log('Contact form submission received:', req.body);
    
    const { name, email, phone, company, service, area, message, recaptchaToken } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Namn, e-post och meddelande är obligatoriska fält.' 
      });
    }

    // Verify reCAPTCHA
    const recaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaValid && process.env.NODE_ENV === 'production' && recaptchaToken) {
      return res.status(400).json({ 
        error: 'reCAPTCHA-verifiering misslyckades. Försök igen.' 
      });
    }

    // console.log('NODE_ENV:', process.env.NODE_ENV);
    // console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
    // console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'SET' : 'NOT SET');
    // console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
    
    const emailConfigured = process.env.EMAIL_USER && 
                           process.env.EMAIL_APP_PASSWORD;
    
    if (!emailConfigured) {
      console.log('Email not configured, logging form submission instead');
      console.log('Form data:', { name, email, phone, company, service, area, message });
      
      return res.json({ 
        success: true, 
        message: 'Meddelandet har mottagits! (Utvecklingsläge: E-post inte konfigurerad än)' 
      });
    }

    // Create email content
    const emailHtml = `
      <h2>Nytt meddelande från Hampaoasen-webbplatsen</h2>
      <p><strong>Namn:</strong> ${name}</p>
      <p><strong>E-post:</strong> ${email}</p>
      ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
      ${company ? `<p><strong>Organisation/Företag:</strong> ${company}</p>` : ''}
      ${service ? `<p><strong>Intresserad av:</strong> ${service}</p>` : ''}
      ${area ? `<p><strong>Ytans storlek:</strong> ${area}</p>` : ''}
      <h3>Meddelande:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
      
      <hr>
      <p><small>Skickat från hampaoasen.se kontaktformulär</small></p>
    `;

    const transporter = createTransporter();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'hampaoasen.noreply@gmail.com',
      to: process.env.EMAIL_TO || 'hampaoasen@gmail.com,akilles.dev@gmail.com',
      subject: `Nytt meddelande från ${name} - Hampaoasen`,
      html: emailHtml,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    res.json({ 
      success: true, 
      message: 'Meddelandet har skickats! Vi återkommer till dig inom kort!' 
    });

  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ 
      error: 'Ett fel uppstod när meddelandet skulle skickas. Försök igen eller kontakta oss direkt på hampaoasen@gmail.com' 
    });
  }
});

// Serve React app for all other routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
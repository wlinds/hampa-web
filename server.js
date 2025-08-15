import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the correct directory for images based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const blogImagesDir = isDevelopment 
  ? path.join(__dirname, 'public', 'blog-images')  // Development: save to public
  : path.join(__dirname, 'dist', 'blog-images');   // Production: save to dist

console.log(`Environment: ${isDevelopment ? 'development' : 'production'}`);
console.log(`Images will be saved to: ${blogImagesDir}`);

// Ensure blog-images directory exists
if (!fs.existsSync(blogImagesDir)) {
  fs.mkdirSync(blogImagesDir, { recursive: true });
  console.log(`Created directory: ${blogImagesDir}`);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, blogImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: { error: 'För många förfrågningar. Försök igen om 15 minuter.' }
});

// Rate limiting for image uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: { error: 'För många bilduppladdningar. Försök igen om 15 minuter.' }
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
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Image upload endpoint
app.post('/api/upload-image', uploadLimiter, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ingen fil uppladdad' });
    }

    console.log(`Image uploaded: ${req.file.filename} to ${req.file.path}`);

    // Return the public URL for the uploaded image
    const imageUrl = `/blog-images/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename,
      savedTo: req.file.path
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      error: 'Fel vid uppladdning av bild' 
    });
  }
});

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
      message: 'Meddelandet har skickats! Vi återkommer inom 24 timmar.' 
    });

  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ 
      error: 'Ett fel uppstod när meddelandet skulle skickas. Försök igen eller kontakta oss direkt på hampaoasen@gmail.com' 
    });
  }
});

// Error handler for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Filen är för stor. Maximal storlek är 50MB.' });
    }
    return res.status(400).json({ error: 'Fel vid filuppladdning' });
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Endast bildfiler är tillåtna' });
  }
  
  next(error);
});

// Serve React app for all other routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { sendEmail } from "./emailService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../../dist")));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EJS Email Template API",
      version: "1.0.0",
      description: "API for sending emails using EJS templates",
    },
  },
  apis: ["./src/index.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve as any,
  swaggerUi.setup(swaggerSpec) as any
);

/**
 * @swagger
 * /send-email:
 *   post:
 *     summary: Send an email with HTML content
 *     description: Sends an email using the provided HTML content, recipient email, and sender email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - html
 *               - recipientEmail
 *             properties:
 *               html:
 *                 type: string
 *                 description: The HTML content of the email
 *                 example: "<h1>Hello World</h1><p>This is a test email.</p>"
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *                 description: The recipient's email address
 *                 example: "recipient@example.com"
 *               senderEmail:
 *                 type: string
 *                 format: email
 *                 description: The sender's email address
 *                 example: "sender@example.com"
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messageId:
 *                   type: string
 *                   description: The message ID of the sent email
 *                   example: "1234567890@example.com"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 example: "Missing required fields: html, recipientEmail"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to send email"
 */
app.post("/send-email", async (req: Request, res: Response) => {
  try {
    const { html, recipientEmail } = req.body;

    if (!html || !recipientEmail) {
      return res.status(400).json({
        error: "Missing required fields: html, recipientEmail",
      });
    }

    const result = await sendEmail(
      html,
      recipientEmail,
      "noreply@yourdomain.com"
    );
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

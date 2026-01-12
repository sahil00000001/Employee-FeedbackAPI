import type { Express } from "express";
import { createServer, type Server } from "http";
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { storage } from "./storage";
import { sendOtpEmail } from "./lib/email";
import mongoose from 'mongoose';

// Route imports using ES modules
import employeeRoutes from './routes/employees.js';
import managerRoutes from './routes/managers.js';
import projectRoutes from './routes/projects.js';
import feedbackAssignmentRoutes from './routes/feedbackAssignment.js';
import feedback360Routes from './routes/feedback360.js';
import kraRoutes from './routes/kra.js';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Middleware
  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  connectDB();

  // Prefix all routes with /api
  app.use('/api/employees', employeeRoutes);
  app.use('/api/managers', managerRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/feedback-assignment', feedbackAssignmentRoutes);
  app.use('/api/feedback-360', feedback360Routes);
  app.use('/api/kra', kraRoutes);

  // Auth/OTP Routes
  app.post("/api/auth/otp/request", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check if user exists in MongoDB collections
    const db = mongoose.connection.db;
    if (!db) return res.status(500).json({ message: "Database not connected" });

    const [employee, manager] = await Promise.all([
      db.collection('Total_Company').findOne({ email }),
      db.collection('Managers').findOne({ email })
    ]);

    if (!employee && !manager) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await storage.createOtp({ email, otp, expiresAt });
    const sent = await sendOtpEmail(email, otp);

    if (!sent) {
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.json({ message: "OTP sent successfully" });
  });

  app.post("/api/auth/otp/verify", async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const otpRecord = await storage.getOtp(email, otp);
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Identify user in MongoDB
    const db = mongoose.connection.db;
    if (!db) return res.status(500).json({ message: "Database not connected" });

    const [employee, manager] = await Promise.all([
      db.collection('Total_Company').findOne({ email }),
      db.collection('Managers').findOne({ email })
    ]);

    const user = employee || manager;
    const role = manager ? "manager" : "employee";

    // In a real app we'd set session here. For this MVP, we'll return user info
    res.json({ 
      user, 
      role,
      message: "Login successful" 
    });
  });

  // Prefix all routes with /api
  app.use('/api/employees', employeeRoutes);
  app.use('/api/managers', managerRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/feedback-assignment', feedbackAssignmentRoutes);
  app.use('/api/feedback-360', feedback360Routes);

  return httpServer;
}

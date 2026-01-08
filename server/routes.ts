import type { Express } from "express";
import { createServer, type Server } from "http";
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Route imports using ES modules
import employeeRoutes from './routes/employees.js';
import managerRoutes from './routes/managers.js';
import projectRoutes from './routes/projects.js';
import feedbackAssignmentRoutes from './routes/feedbackAssignment.js';
import feedback360Routes from './routes/feedback360.js';

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

  return httpServer;
}

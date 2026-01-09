
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Employees (Total_Company)
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  department: text("department"),
  role: text("role"),
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Managers
export const managers = pgTable("managers", {
  id: serial("id").primaryKey(),
  managerId: text("manager_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  isActive: boolean("is_active").default(true),
  projectId: text("project_id"), // Primary project ID
});

// Projects (Project_Details)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull().unique(),
  name: text("name").notNull(),
  managerId: text("manager_id"), // Reference to manager_id string
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

// Project Members (Mapping employees to projects)
export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  employeeId: text("employee_id").notNull(),
});

// Feedback Assignments (Peer_Group)
export const feedbackAssignments = pgTable("feedback_assignments", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(), // Employee being reviewed
  managerId: text("manager_id"),
  cycleYear: integer("cycle_year").default(2024),
  peers: text("peers").array(), // Array of employee_ids assigned as peers
});

// 360 Feedback (Feedback_360)
export const feedback360 = pgTable("feedback_360", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(), // Target employee
  reviewerId: text("reviewer_id").notNull(), // Source employee/reviewer
  reviewerName: text("reviewer_name"),
  projectId: text("project_id"),
  feedbackType: text("feedback_type").notNull(), // 'assigned' | 'optional'
  
  // Ratings
  technicalSkills: integer("technical_skills").notNull(),
  communication: integer("communication").notNull(),
  teamwork: integer("teamwork").notNull(),
  leadership: integer("leadership").notNull(),
  problemSolving: integer("problem_solving").notNull(),
  
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// OTP Storage
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// === SCHEMAS ===

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, joinedAt: true });
export const insertManagerSchema = createInsertSchema(managers).omit({ id: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertFeedbackAssignmentSchema = createInsertSchema(feedbackAssignments).omit({ id: true });
export const insertFeedback360Schema = createInsertSchema(feedback360).omit({ id: true, createdAt: true });
export const insertOtpSchema = createInsertSchema(otps).omit({ id: true });

// === TYPES ===
export type Otp = typeof otps.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Manager = typeof managers.$inferSelect;
export type InsertManager = z.infer<typeof insertManagerSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type FeedbackAssignment = typeof feedbackAssignments.$inferSelect;
export type InsertFeedbackAssignment = z.infer<typeof insertFeedbackAssignmentSchema>;

export type Feedback360 = typeof feedback360.$inferSelect;
export type InsertFeedback360 = z.infer<typeof insertFeedback360Schema>;

export type FeedbackSummary = {
  employeeId: string;
  overallRating: number;
  categoryAverages: {
    technicalSkills: number;
    communication: number;
    teamwork: number;
    leadership: number;
    problemSolving: number;
  };
  feedbackCount: number;
};

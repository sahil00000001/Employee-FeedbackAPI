
import { 
  employees, managers, projects, projectMembers, feedbackAssignments, feedback360, otps,
  type Employee, type InsertEmployee,
  type Manager, type InsertManager,
  type Project, type InsertProject,
  type Feedback360, type InsertFeedback360,
  type Otp, type InsertOtp
} from "@shared/schema";
import { db } from "./db";
import { eq, inArray, and, lt } from "drizzle-orm";

export interface IStorage {
  // Employees
  getEmployees(filters?: { active?: boolean, department?: string }): Promise<Employee[]>;
  getEmployee(employeeId: string): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  
  // Managers
  getManagers(): Promise<Manager[]>;
  getManager(managerId: string): Promise<Manager | undefined>;
  getManagerByEmail(email: string): Promise<Manager | undefined>;
  getManagerTeam(managerId: string): Promise<Employee[]>;
  createManager(manager: InsertManager): Promise<Manager>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(projectId: string): Promise<Project | undefined>;
  getProjectMembers(projectId: string): Promise<Employee[]>;
  createProject(project: InsertProject): Promise<Project>;
  addProjectMember(projectId: string, employeeId: string): Promise<void>;

  // Feedback
  createFeedback(feedback: InsertFeedback360): Promise<Feedback360>;
  getFeedbackForEmployee(employeeId: string): Promise<Feedback360[]>;

  // OTP
  createOtp(otp: InsertOtp): Promise<Otp>;
  getOtp(email: string, otp: string): Promise<Otp | undefined>;
  deleteExpiredOtps(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Employees
  async getEmployees(filters?: { active?: boolean, department?: string }): Promise<Employee[]> {
    let query = db.select().from(employees);
    const conditions = [];
    
    if (filters?.active !== undefined) {
      conditions.push(eq(employees.isActive, filters.active));
    }
    if (filters?.department) {
      conditions.push(eq(employees.department, filters.department));
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async getEmployee(employeeId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.employeeId, employeeId));
    return employee;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.email, email));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  // Managers
  async getManagers(): Promise<Manager[]> {
    return await db.select().from(managers);
  }

  async getManager(managerId: string): Promise<Manager | undefined> {
    const [manager] = await db.select().from(managers).where(eq(managers.managerId, managerId));
    return manager;
  }

  async getManagerByEmail(email: string): Promise<Manager | undefined> {
    const [manager] = await db.select().from(managers).where(eq(managers.email, email));
    return manager;
  }

  async getManagerTeam(managerId: string): Promise<Employee[]> {
    // Find feedback assignments where manager is set
    const assignments = await db.select().from(feedbackAssignments).where(eq(feedbackAssignments.managerId, managerId));
    const employeeIds = assignments.map(a => a.employeeId);
    
    if (employeeIds.length === 0) return [];
    
    return await db.select().from(employees).where(inArray(employees.employeeId, employeeIds));
  }
  
  async createManager(manager: InsertManager): Promise<Manager> {
    const [newManager] = await db.insert(managers).values(manager).returning();
    return newManager;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(projectId: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.projectId, projectId));
    return project;
  }

  async getProjectMembers(projectId: string): Promise<Employee[]> {
    const members = await db.select().from(projectMembers).where(eq(projectMembers.projectId, projectId));
    const memberIds = members.map(m => m.employeeId);
    
    if (memberIds.length === 0) return [];
    
    return await db.select().from(employees).where(inArray(employees.employeeId, memberIds));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async addProjectMember(projectId: string, employeeId: string): Promise<void> {
    await db.insert(projectMembers).values({ projectId, employeeId });
  }

  // Feedback
  async createFeedback(feedback: InsertFeedback360): Promise<Feedback360> {
    const [newFeedback] = await db.insert(feedback360).values(feedback).returning();
    return newFeedback;
  }

  async getFeedbackForEmployee(employeeId: string): Promise<Feedback360[]> {
    return await db.select().from(feedback360).where(eq(feedback360.employeeId, employeeId));
  }

  // OTP
  async createOtp(otp: InsertOtp): Promise<Otp> {
    const [newOtp] = await db.insert(otps).values(otp).returning();
    return newOtp;
  }

  async getOtp(email: string, otp: string): Promise<Otp | undefined> {
    const [record] = await db.select().from(otps).where(
      and(
        eq(otps.email, email),
        eq(otps.otp, otp)
      )
    );
    return record;
  }

  async deleteExpiredOtps(): Promise<void> {
    await db.delete(otps).where(lt(otps.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();

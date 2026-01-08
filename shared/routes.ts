
import { z } from 'zod';
import { 
  insertEmployeeSchema, 
  insertManagerSchema, 
  insertProjectSchema, 
  insertFeedbackAssignmentSchema, 
  insertFeedback360Schema,
  employees,
  managers,
  projects,
  feedbackAssignments,
  feedback360
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  employees: {
    list: {
      method: 'GET' as const,
      path: '/api/employees',
      responses: {
        200: z.any(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/employees/:employee_id',
      responses: {
        200: z.any(),
      },
    },
  },
  managers: {
    list: {
      method: 'GET' as const,
      path: '/api/managers',
      responses: {
        200: z.any(),
      },
    },
    getTeam: {
      method: 'GET' as const,
      path: '/api/managers/:manager_id/team',
      responses: {
        200: z.any(),
      },
    },
  },
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.any(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:project_id',
      responses: {
        200: z.any(),
      },
    },
  },
  feedback: {
    submit: {
      method: 'POST' as const,
      path: '/api/feedback-360/submit',
      responses: {
        201: z.any(),
      },
    },
    summary: {
      method: 'GET' as const,
      path: '/api/feedback-360/summary/:employee_id',
      responses: {
        200: z.any(),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

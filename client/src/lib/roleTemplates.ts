export interface FeedbackPoint {
  id: string;
  label: string;
  description: string;
  rating?: number;
}

export interface FeedbackCategory {
  id: string;
  title: string;
  description: string;
  points: FeedbackPoint[];
}

export interface RoleTemplate {
  role: string;
  categories: FeedbackCategory[];
}

export const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
  "Developer": {
    role: "Developer",
    categories: [
      {
        id: "collaboration",
        title: "Collaboration and Teamwork",
        description: "How effectively do you collaborate with other team members?",
        points: [
          { id: "dev-collab-1", label: "QA/BA Sync", description: "Collaborating closely with QA, BA, and other developers to ensure smooth feature development and integration." }
        ]
      },
      {
        id: "communication",
        title: "Communication",
        description: "How well do you communicate with peers, leaders, and stakeholders?",
        points: [
          { id: "dev-comm-1", label: "Clarity", description: "Effectively communicating code-related challenges, progress, and requesting/receiving feedback." }
        ]
      },
      {
        id: "problem-solving",
        title: "Problem-Solving and Innovation",
        description: "How effectively do you identify and solve challenges?",
        points: [
          { id: "dev-ps-1", label: "Optimization", description: "Addressing coding issues, debugging, optimizing performance, and suggesting new approaches or tools." }
        ]
      }
    ]
  },
  "Quality Assurance": {
    role: "Quality Assurance",
    categories: [
      {
        id: "collaboration",
        title: "Collaboration and Teamwork",
        description: "Working closely with developers and BAs.",
        points: [
          { id: "qa-collab-1", label: "Team Sync", description: "Working closely with developers, BAs, and other QA team members to ensure smooth testing cycles." }
        ]
      },
      {
        id: "communication",
        title: "Communication",
        description: "Communicating test plans and defects.",
        points: [
          { id: "qa-comm-1", label: "Defect Reporting", description: "Effectively communicating test plans, defects, and feedback to developers, BA, and other stakeholders." }
        ]
      }
    ]
  },
  "Business Analyst": {
    role: "Business Analyst",
    categories: [
      {
        id: "collaboration",
        title: "Collaboration and Teamwork",
        description: "Collaborating with stakeholders.",
        points: [
          { id: "ba-collab-1", label: "Stakeholder Alignment", description: "Collaborating closely with developers, QA, and stakeholders to ensure requirements are well understood." }
        ]
      },
      {
        id: "communication",
        title: "Communication",
        description: "Communicating requirements and user stories.",
        points: [
          { id: "ba-comm-1", label: "Requirement Clarity", description: "Communicating requirements, user stories, and business goals clearly to all stakeholders." }
        ]
      }
    ]
  },
  "DevOps": {
    role: "DevOps",
    categories: [
      {
        id: "collaboration",
        title: "Collaboration and Teamwork",
        description: "Integration and deployment support.",
        points: [
          { id: "do-collab-1", label: "Ops Sync", description: "Collaborating with developers, QA, and other team members for smooth integration and deployment." }
        ]
      },
      {
        id: "quality",
        title: "Work Quality and Attention to Detail",
        description: "Automation and system configurations.",
        points: [
          { id: "do-qual-1", label: "Pipeline Reliability", description: "Ensuring that automation scripts, deployment pipelines, and system configurations are error-free." }
        ]
      }
    ]
  },
  "UI/UX Designer": {
    role: "UI/UX Designer",
    categories: [
      {
        id: "quality",
        title: "Work Quality and Attention to Detail",
        description: "Pixel-perfect designs.",
        points: [
          { id: "design-qual-1", label: "Pixel Perfection", description: "Delivering pixel-perfect designs, ensuring UI elements are consistent and intuitive." }
        ]
      },
      {
        id: "problem-solving",
        title: "Problem-Solving and Innovation",
        description: "Solving complex user experience issues.",
        points: [
          { id: "design-ps-1", label: "UX Innovation", description: "Solving complex user experience issues and innovating design approaches." }
        ]
      }
    ]
  },
  "HR": {
    role: "HR Recruitment & HR Manager",
    categories: [
      {
        id: "collaboration",
        title: "Collaboration and Teamwork",
        description: "Collaborating with hiring managers.",
        points: [
          { id: "hr-collab-1", label: "Hiring Sync", description: "Collaborating with hiring managers, team leads, and other departments to understand staffing needs." }
        ]
      },
      {
        id: "communication",
        title: "Communication",
        description: "Communicating with candidates and leaders.",
        points: [
          { id: "hr-comm-1", label: "Stakeholder Comms", description: "Effectively communicating with candidates, department heads, and leadership." }
        ]
      }
    ]
  },
  "Intern": {
    role: "Intern",
    categories: [
      {
        id: "collaboration",
        title: "Collaboration and Teamwork",
        description: "Learning and contributing to team tasks.",
        points: [
          { id: "intern-collab-1", label: "Learning & Contribution", description: "Working well with developers, QA engineers, and other team members to learn and contribute." }
        ]
      },
      {
        id: "communication",
        title: "Communication",
        description: "Communicating with mentors.",
        points: [
          { id: "intern-comm-1", label: "Mentor Sync", description: "Communicating clearly with mentors, team members, and managers, asking for clarification." }
        ]
      }
    ]
  }
};

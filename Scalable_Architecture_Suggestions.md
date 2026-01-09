# Scalable Performance Management System - Database Architecture Suggestions

To build a "very, very big project" that is multiscalable and highly optimized, I suggest moving towards a highly normalized and modular database structure. Below is a proposed architecture that can handle dynamic templates, complex review cycles, and large-scale corporate hierarchies.

## 1. Core Organizational Tables
These tables handle the corporate structure and are optimized for fast lookups and hierarchical queries.

### `organizations`
*   `id` (UUID): Primary key.
*   `name` (String): Organization name.
*   `settings` (JSONB): Global settings like review cycles, default themes, etc.

### `departments`
*   `id` (UUID): Primary key.
*   `org_id` (UUID): Reference to organization.
*   `name` (String): e.g., "Software Development", "HR".
*   `parent_dept_id` (UUID): Self-reference for sub-departments.

### `roles`
*   `id` (UUID): Primary key.
*   `org_id` (UUID): Reference to organization.
*   `name` (String): e.g., "Senior Developer", "QA Lead".
*   `base_template_id` (UUID): Reference to the default feedback template for this role.

### `users` (Employees)
*   `id` (UUID): Primary key.
*   `org_id` (UUID): Reference to organization.
*   `dept_id` (UUID): Reference to department.
*   `role_id` (UUID): Reference to roles.
*   `manager_id` (UUID): Self-reference to user (manager).
*   `status` (Enum): 'active', 'inactive', 'onboarding'.

## 2. Dynamic Template System
This is the core of the role-specific forms you requested. It allows you to define categories and points once and reuse them.

### `competency_frameworks`
*   `id` (UUID): Primary key.
*   `name` (String): e.g., "Technical Excellence", "Leadership & Values".
*   `description` (Text).

### `template_categories`
*   `id` (UUID): Primary key.
*   `framework_id` (UUID): Reference to framework.
*   `title` (String): e.g., "Collaboration".
*   `weight` (Decimal): For weighted score calculations.

### `template_points`
*   `id` (UUID): Primary key.
*   `category_id` (UUID): Reference to category.
*   `label` (String): e.g., "Code Review Quality".
*   `description` (Text): Detailed guidance for the reviewer.

### `feedback_templates`
*   `id` (UUID): Primary key.
*   `name` (String): e.g., "Developer Performance Review 2026".
*   `role_id` (UUID): Optional filter for role-specific defaults.
*   `config` (JSONB): Array of category and point IDs to include.

## 3. Review Cycles & Feedback
Optimized for high-volume feedback submission and complex reporting.

### `review_cycles`
*   `id` (UUID): Primary key.
*   `name` (String): e.g., "Q1 2026 Performance Review".
*   `start_date` (Timestamp).
*   `end_date` (Timestamp).
*   `status` (Enum): 'draft', 'active', 'locked', 'archived'.

### `review_assignments`
*   `id` (UUID): Primary key.
*   `cycle_id` (UUID): Reference to review cycle.
*   `subject_id` (UUID): User being reviewed.
*   `reviewer_id` (UUID): User performing the review.
*   `relationship` (Enum): 'manager', 'peer', 'subordinate', 'self'.
*   `status` (Enum): 'pending', 'started', 'submitted'.

### `feedback_responses`
*   `id` (UUID): Primary key.
*   `assignment_id` (UUID): Reference to assignment.
*   `template_id` (UUID): Reference to the template used.
*   `overall_score` (Decimal): Cached aggregate score.
*   `comments` (Text): General feedback.

### `feedback_item_scores`
*   `id` (UUID): Primary key.
*   `response_id` (UUID): Reference to response.
*   `point_id` (UUID): Reference to template_points.
*   `rating` (Integer): 1-5 score.
*   `note` (Text): Context for this specific point.

## 4. Why this is Scalable & Optimized
1.  **Normalization:** By separating `template_points` from `feedback_responses`, you can update descriptions once and they reflect everywhere.
2.  **Indexing:** High-volume tables like `feedback_item_scores` should be indexed on `response_id` and `point_id` for fast analytics.
3.  **JSONB vs Structured:** Using a structured approach for scores (`feedback_item_scores`) allows for powerful SQL aggregations (average score per department, trend analysis over time), which is impossible with flat JSON.
4.  **Flexible Assignments:** The `review_assignments` table allows for 360, 180, and self-reviews within the same system.

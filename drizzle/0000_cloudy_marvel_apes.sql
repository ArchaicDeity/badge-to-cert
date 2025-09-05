CREATE TABLE `assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`block_id` integer NOT NULL,
	`time_limit_minutes` integer,
	`num_questions` integer NOT NULL,
	`pass_mark_percent` integer NOT NULL,
	`retake_cooldown_minutes` integer DEFAULT 10,
	`max_attempts` integer DEFAULT 2,
	`shuffle_questions` integer DEFAULT 1,
	FOREIGN KEY (`block_id`) REFERENCES `course_blocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `content_units` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`block_id` integer NOT NULL,
	`content_type` text NOT NULL,
	`source_path` text,
	`html_body` text,
	`duration_minutes` integer,
	FOREIGN KEY (`block_id`) REFERENCES `course_blocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `course_blocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`position` integer NOT NULL,
	`is_mandatory` integer DEFAULT 1 NOT NULL,
	`config_json` text,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`code` text,
	`description` text,
	`version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`enterprise_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`enterprise_id`) REFERENCES `enterprises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `enrollment_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`enrollment_id` integer NOT NULL,
	`block_id` integer NOT NULL,
	`status` text DEFAULT 'NOT_STARTED' NOT NULL,
	`started_at` text,
	`completed_at` text,
	`score` integer,
	`attempts` integer DEFAULT 0,
	FOREIGN KEY (`block_id`) REFERENCES `course_blocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enrollment_block_unique` ON `enrollment_progress` (`enrollment_id`,`block_id`);--> statement-breakpoint
CREATE TABLE `enterprises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`brand_logo_path` text,
	`brand_primary_color` text,
	`brand_secondary_color` text,
	`brand_login_message` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enterprises_slug_unique` ON `enterprises` (`slug`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assessment_id` integer NOT NULL,
	`type` text NOT NULL,
	`body` text NOT NULL,
	`choices_json` text,
	`correct_index` integer,
	`correct_bool` integer,
	`explanation` text,
	`tags` text,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `review_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`enterprise_id` integer,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`submitted_by` integer,
	`reviewed_by` integer,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`reviewed_at` text,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`enterprise_id`) REFERENCES `enterprises`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `course_blocks` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `course_id` integer NOT NULL,
    `kind` text NOT NULL,
    `title` text NOT NULL,
    `position` integer NOT NULL,
    `is_mandatory` integer DEFAULT 1 NOT NULL,
    `config_json` text,
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX `course_blocks_course_position_unique` ON `course_blocks` (`course_id`,`position`);

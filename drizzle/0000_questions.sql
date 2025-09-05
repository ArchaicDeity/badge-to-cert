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
  CHECK (`type` IN ('MCQ','TF')),
  CHECK (`type` != 'MCQ' OR `choices_json` IS NOT NULL),
  CHECK (`type` != 'MCQ' OR `correct_index` IS NOT NULL),
  CHECK (`type` != 'TF' OR `correct_bool` IS NOT NULL)
);

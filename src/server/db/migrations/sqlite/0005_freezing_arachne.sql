CREATE TABLE `page_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `page_revisions_page_id_idx` ON `page_revisions` (`page_id`);
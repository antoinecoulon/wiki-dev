CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`title` text DEFAULT 'Sans titre' NOT NULL,
	`content` text,
	`content_text` text,
	`position` integer DEFAULT 8 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);

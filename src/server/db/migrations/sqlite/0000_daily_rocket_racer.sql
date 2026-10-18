CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Sans titre' NOT NULL,
	`content` text,
	`space` text DEFAULT 'perso' NOT NULL,
	`section` text DEFAULT 'doc' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);

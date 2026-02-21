-- liquibase formatted sql
-- changeset TiiBnTickTeam:20260221-add-urgency-to-announcement
-- Add urgency column to announcements table

ALTER TABLE announcements ADD COLUMN IF NOT EXISTS urgency VARCHAR(50);

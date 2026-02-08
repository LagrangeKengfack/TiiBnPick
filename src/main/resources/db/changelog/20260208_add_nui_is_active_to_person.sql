-- liquibase formatted sql
-- changeset antigravity:20260208-add-nui-is-active-to-person
ALTER TABLE persons ADD COLUMN nui VARCHAR(255);
ALTER TABLE persons ADD COLUMN is_active BOOLEAN DEFAULT FALSE;

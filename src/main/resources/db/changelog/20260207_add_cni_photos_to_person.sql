-- liquibase formatted sql
-- changeset antigravity:20260207-add-cni-photos-to-person
ALTER TABLE persons ADD COLUMN cni_recto VARCHAR(255);
ALTER TABLE persons ADD COLUMN cni_verso VARCHAR(255);

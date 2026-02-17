-- liquibase formatted sql

-- changeset TicBnPickTeam:20260210-add-weight-to-packets
ALTER TABLE packets ADD COLUMN IF NOT EXISTS weight DOUBLE PRECISION;

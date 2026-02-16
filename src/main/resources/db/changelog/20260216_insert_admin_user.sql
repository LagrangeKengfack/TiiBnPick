-- liquibase formatted sql
-- changeset antigravity:20260216-insert-admin-user

-- Insert Admin Person
-- Password is 'password' hashed with BCrypt
INSERT INTO persons (id, first_name, last_name, email, phone, password, national_id, photo_card, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000002', -- Fixed ID for Admin
    'Admin', 
    'User', 
    'admin@test.com', 
    '+000000000001', 
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', -- 'password'
    'ADMIN_NATIONAL_ID', 
    'ADMIN_PHOTO_CARD_URL',
    'ADMIN',
    true
)
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

-- Ensure NO entry in clients or delivery_persons for this ID to enforce Admin logic
DELETE FROM clients WHERE person_id = '00000000-0000-0000-0000-000000000002';
DELETE FROM delivery_persons WHERE person_id = '00000000-0000-0000-0000-000000000002';

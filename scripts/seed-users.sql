

DELETE FROM users;

INSERT INTO users (id, jwt_id, email, name, avatar, location, timezone, auth_provider, auth_provider_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'sarah@example.com', 'Sarah Johnson', NULL, 'Stockholm, Sweden', 'Europe/Stockholm', 'email', NULL, '2024-01-15T10:30:00Z', '2024-01-15T10:30:00Z'),

('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'mike@example.com', 'Mike Chen', NULL, 'Stockholm, Sweden', 'Europe/Stockholm', 'email', NULL, '2024-01-10T14:20:00Z', '2024-01-10T14:20:00Z'),

('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'alex@example.com', 'Alex Rodriguez', NULL, 'Stockholm, Sweden', 'Europe/Stockholm', 'email', NULL, '2024-01-20T09:15:00Z', '2024-01-20T09:15:00Z'),

('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'emma@example.com', 'Emma Wilson', NULL, 'London, UK', 'Europe/London', 'email', NULL, '2024-01-12T08:45:00Z', '2024-01-12T08:45:00Z'),

('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', 'david@example.com', 'David Kim', NULL, 'New York, USA', 'America/New_York', 'email', NULL, '2024-01-18T16:20:00Z', '2024-01-18T16:20:00Z'),

('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440006', 'lisa@example.com', 'Lisa Anderson', NULL, 'Los Angeles, USA', 'America/Los_Angeles', 'email', NULL, '2024-01-22T11:30:00Z', '2024-01-22T11:30:00Z'),

('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440007', 'james@example.com', 'James Brown', NULL, 'Stockholm, Sweden', 'Europe/Stockholm', 'email', NULL, '2024-01-25T14:15:00Z', '2024-01-25T14:15:00Z');

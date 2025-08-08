-- Create test admin user (password is 'admin123' encrypted)
INSERT INTO userm (username, email, password, phone, role) VALUES 
('admin', 'admin@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye8eHKaZ6YU1PQ5fJZGQ1k3xY8ZfG.ZCG', '1234567890', 'ADMIN');

-- Create test user (password is 'user123' encrypted)
INSERT INTO userm (username, email, password, phone, role) VALUES 
('user', 'user@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye8eHKaZ6YU1PQ5fJZGQ1k3xY8ZfG.ZCG', '0987654321', 'USER');

-- Get admin ID
SET @admin_id = (SELECT id FROM userm WHERE email = 'admin@test.com');

-- Create test buses
INSERT INTO busm (busnum, source, destination, departuretime, arrivaltime, totalseats, availableseats, admin_id) VALUES 
('BUS001', 'Chennai', 'Bangalore', '2025-08-08 08:00:00', '2025-08-08 14:00:00', 40, 40, @admin_id),
('BUS002', 'Bangalore', 'Chennai', '2025-08-08 09:00:00', '2025-08-08 15:00:00', 35, 35, @admin_id),
('BUS003', 'Chennai', 'Coimbatore', '2025-08-08 10:00:00', '2025-08-08 16:00:00', 30, 30, @admin_id),
('BUS004', 'Mumbai', 'Pune', '2025-08-08 07:00:00', '2025-08-08 10:00:00', 50, 50, @admin_id),
('BUS005', 'Delhi', 'Agra', '2025-08-08 06:00:00', '2025-08-08 12:00:00', 45, 45, @admin_id);

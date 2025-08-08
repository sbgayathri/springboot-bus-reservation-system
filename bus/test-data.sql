-- Test data for bus application
USE bus;

-- Insert admin user
INSERT INTO userm (username, email, password, phone, role) VALUES 
('admin', 'admin@bus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye8eHKaZ6YU1PQ5fJZGQ1k3xY8ZfG.ZCG', '1234567890', 'ADMIN');

-- Get admin ID (assuming it will be 1 for first admin)
SET @admin_id = LAST_INSERT_ID();

-- Insert test buses
INSERT INTO busm (busnum, source, destination, departuretime, arrivaltime, totalseats, availableseats, admin_id) VALUES 
('BUS001', 'Chennai', 'Bangalore', '2025-08-08 08:00:00', '2025-08-08 14:00:00', 40, 40, @admin_id),
('BUS002', 'Bangalore', 'Chennai', '2025-08-08 09:00:00', '2025-08-08 15:00:00', 35, 35, @admin_id),
('BUS003', 'Chennai', 'Coimbatore', '2025-08-08 10:00:00', '2025-08-08 16:00:00', 30, 30, @admin_id),
('BUS004', 'Coimbatore', 'Chennai', '2025-08-08 11:00:00', '2025-08-08 17:00:00', 45, 45, @admin_id),
('BUS005', 'Bangalore', 'Mysore', '2025-08-08 12:00:00', '2025-08-08 18:00:00', 25, 25, @admin_id);

-- Insert another admin user
INSERT INTO userm (username, email, password, phone, role) VALUES 
('admin2', 'admin2@bus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye8eHKaZ6YU1PQ5fJZGQ1k3xY8ZfG.ZCG', '0987654321', 'ADMIN');

SET @admin2_id = LAST_INSERT_ID();

-- Insert more test buses for admin2
INSERT INTO busm (busnum, source, destination, departuretime, arrivaltime, totalseats, availableseats, admin_id) VALUES 
('BUS006', 'Mumbai', 'Pune', '2025-08-08 07:00:00', '2025-08-08 10:00:00', 50, 50, @admin2_id),
('BUS007', 'Pune', 'Mumbai', '2025-08-08 13:00:00', '2025-08-08 16:00:00', 50, 50, @admin2_id);

-- Check data
SELECT 'Users:' as Table_Name;
SELECT * FROM userm;

SELECT 'Buses:' as Table_Name;
SELECT * FROM busm;

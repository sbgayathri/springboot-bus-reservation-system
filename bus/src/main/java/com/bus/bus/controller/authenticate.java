package com.bus.bus.controller;

import java.util.Optional;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bus.bus.model.userm;
import com.bus.bus.repository.userr;
import com.bus.bus.security.JwtUtil;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/auth")
public class authenticate {
    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private userr repo;

    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/register")
    public String register(@RequestBody userm user) {
        Optional<userm> exist = repo.findByEmail(user.getEmail());
        if (exist.isPresent()) return "User already exists";

        user.setPassword(encoder.encode(user.getPassword()));
        
        // Set role - use provided role or default to "USER"
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        } else {
            // Validate role values
            String role = user.getRole().toUpperCase();
            if (role.equals("USER") || role.equals("ADMIN")) {
                user.setRole(role);
            } else {
                user.setRole("USER"); // Default to USER for invalid roles
            }
        }
        
        repo.save(user);
        return "Registered successfully";
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> req) {
        try {
            System.out.println("🔐 Login attempt received...");
            String email = req.get("email");
            String password = req.get("password");
            
            System.out.println("📧 Email: " + email);

            // Authenticate the user
            authManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
            System.out.println("✅ Authentication successful");
            
            // Get user details
            Optional<userm> userOpt = repo.findByEmail(email);
            if (userOpt.isEmpty()) {
                System.out.println("❌ User not found in database");
                return Map.of("error", "User not found");
            }
            
            userm user = userOpt.get();
            System.out.println("👤 User found: " + user.getUsername() + " - Role: " + user.getRole());
            
            UserDetails userDetails = new User(user.getEmail(), user.getPassword(),
                    java.util.Collections.singleton(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole())));

            String token = jwtUtil.generateToken(userDetails);
            System.out.println("🎫 JWT token generated successfully");
            
            Map<String, Object> response = Map.of("token", token, "user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "phone", user.getPhone()
            ));
            
            System.out.println("✅ Login successful, returning response");
            return response;
            
        } catch (Exception e) {
            System.err.println("❌ Login failed: " + e.getMessage());
            e.printStackTrace();
            return Map.of("error", "Invalid credentials: " + e.getMessage());
        }
    }
    
    @GetMapping("/profile")
    public Map<String, Object> getProfile(Authentication auth) {
        try {
            String email = auth.getName();
            Optional<userm> userOpt = repo.findByEmail(email);
            if (userOpt.isEmpty()) {
                return Map.of("error", "User not found");
            }
            
            userm user = userOpt.get();
            return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "phone", user.getPhone()
            );
        } catch (Exception e) {
            return Map.of("error", "Failed to get profile: " + e.getMessage());
        }
    }
    
    @PostMapping("/create-test-data")
    public Map<String, Object> createTestData() {
        try {
            // Create admin user
            userm admin = new userm();
            admin.setUsername("admin");
            admin.setEmail("admin@bus.com");
            admin.setPassword(encoder.encode("admin123"));
            admin.setPhone("1234567890");
            admin.setRole("ADMIN");
            userm savedAdmin = repo.save(admin);
            
            // Create test buses using busRepository
            System.out.println("🏗️ Created test admin with ID: " + savedAdmin.getId());
            
            return Map.of("message", "Test admin created successfully", "adminId", savedAdmin.getId());
        } catch (Exception e) {
            System.err.println("❌ Error creating test data: " + e.getMessage());
            e.printStackTrace();
            return Map.of("error", "Failed to create test data: " + e.getMessage());
        }
    }
    
}

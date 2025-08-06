package com.bus.bus.controller;

import java.util.Optional;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bus.bus.model.userm;
import com.bus.bus.repository.userr;
import com.bus.bus.security.JwtUtil;

import org.springframework.web.bind.annotation.PostMapping;
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
    public Map<String, String> login(@RequestBody Map<String, String> req) {
        try {
            String email = req.get("email");
            String password = req.get("password");

            // Authenticate the user
            authManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
            
            // Get user details
            Optional<userm> userOpt = repo.findByEmail(email);
            if (userOpt.isEmpty()) {
                return Map.of("error", "User not found");
            }
            
            userm user = userOpt.get();
            UserDetails userDetails = new User(user.getEmail(), user.getPassword(),
                    java.util.Collections.singleton(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole())));

            String token = jwtUtil.generateToken(userDetails);
            return Map.of("token", token, "email", user.getEmail(), "role", user.getRole());
            
        } catch (Exception e) {
            return Map.of("error", "Invalid credentials: " + e.getMessage());
        }
    }
    
}

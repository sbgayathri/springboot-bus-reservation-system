package com.bus.bus.service;

import java.util.List;
import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bus.bus.model.userm;
import com.bus.bus.repository.userr;

@Service
public class users {

    @Autowired
    private userr userRepository;
    @Autowired
    private ModelMapper  mm;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public ModelMapper modelmapper(){
        return new ModelMapper();
    }
    public List<userm> getAllUsers() {
        return userRepository.findAll();
    }

    public userm getUserById(int id) {
        return userRepository.findById(id).orElse(null);
    }

    public userm saveUser(userm user) {
        return userRepository.save(user);
    }

    public ResponseEntity<String> updateprofile(int userid, userm u) {
        Optional<userm> us=userRepository.findById(userid);
        if(us.isPresent()){
            userm existingUser = us.get();
            
            // Update only the allowed fields
            if (u.getUsername() != null && !u.getUsername().trim().isEmpty()) {
                existingUser.setUsername(u.getUsername());
            }
            if (u.getEmail() != null && !u.getEmail().trim().isEmpty()) {
                existingUser.setEmail(u.getEmail());
            }
            if (u.getPhone() != null && !u.getPhone().trim().isEmpty()) {
                existingUser.setPhone(u.getPhone());
            }
            if (u.getPassword() != null && !u.getPassword().trim().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(u.getPassword()));
            }
            // Don't update role or ID - keep existing values
            
            userRepository.save(existingUser);
            return ResponseEntity.ok("Profile updated successfully");
        }
        return ResponseEntity.badRequest().body("User not found");
    }
}

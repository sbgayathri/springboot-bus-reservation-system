package com.bus.bus.service;

import java.util.List;
import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.bus.bus.model.userm;
import com.bus.bus.repository.userr;

@Service
public class users {

    @Autowired
    private userr userRepository;
    @Autowired
    private ModelMapper  mm;

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
            mm.map(u,us.get());
            userRepository.save(us.get());
            return ResponseEntity.ok("Profile updated successfully");
        }
        return null;
    }
}

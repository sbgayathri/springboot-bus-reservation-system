package com.bus.bus.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bus.bus.model.bookingm;
import com.bus.bus.model.userm;
import com.bus.bus.repository.bookingr;
import com.bus.bus.repository.userr;

@Service
public class admins {

    @Autowired
    private userr ur;
    @Autowired
    private bookingr bkr;
    @Autowired
    private PasswordEncoder passwordEncoder;

    
    /*public busm updatebus(int id, busm b) {
       
        Optional<busm> ob=br.findById(id);
        if(ob.isPresent()){
            modelMapper.map(b, ob.get());
            return br.save(ob.get());
            
        }
        return null;

     
    }*/

    public List<bookingm> getBookingForbus(int busid) {
       return bkr.findByBus_Id(busid);
       
    }

    public List<userm> getuserbybus(int busid) {
        return ur.finduserbybusid(busid);
    }

    public userm updateadmin(int adminid, userm a) {
        Optional<userm> ex=ur.findById(adminid);
        if(ex.isPresent()){
            userm existingAdmin = ex.get();
            
            // Update only the allowed fields, preserve role and ID
            if (a.getUsername() != null && !a.getUsername().trim().isEmpty()) {
                existingAdmin.setUsername(a.getUsername());
            }
            if (a.getEmail() != null && !a.getEmail().trim().isEmpty()) {
                existingAdmin.setEmail(a.getEmail());
            }
            if (a.getPhone() != null && !a.getPhone().trim().isEmpty()) {
                existingAdmin.setPhone(a.getPhone());
            }
            if (a.getPassword() != null && !a.getPassword().trim().isEmpty()) {
                existingAdmin.setPassword(passwordEncoder.encode(a.getPassword()));
            }
            // Don't update role or ID - keep existing values
            
            ur.save(existingAdmin);
            return existingAdmin;
        }
        return null;
    }
}

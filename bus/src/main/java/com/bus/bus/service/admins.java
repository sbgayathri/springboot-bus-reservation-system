package com.bus.bus.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Bean;

import org.modelmapper.ModelMapper;
import com.bus.bus.model.bookingm;
import com.bus.bus.model.busm;
import com.bus.bus.model.userm;
import com.bus.bus.repository.bookingr;
import com.bus.bus.repository.busr;
import com.bus.bus.repository.userr;

@Service
public class admins {

    @Autowired
    private userr ur;
    @Autowired
    private bookingr bkr;
    @Autowired
    private busr br;
    @Autowired
    private ModelMapper modelMapper;

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    
    /*public busm updatebus(int id, busm b) {
       
        Optional<busm> ob=br.findById(id);
        if(ob.isPresent()){
            modelMapper.map(b, ob.get());
            return br.save(ob.get());
            
        }
        return null;

     
    }*/

    public List<bookingm> getBookingForbus(int busid) {
       return bkr.findByBusid(busid);
       
    }

    public List<userm> getuserbybus(int busid) {
        return ur.finduserbybusid(busid);
    }

    public userm updateadmin(int adminid, userm a) {
        Optional<userm> ex=ur.findById(adminid);
        if(ex.isPresent()){
            userm u=ex.get();
            modelMapper.map(a, u);
            ur.save(u);
        }
        return null;
    }
}

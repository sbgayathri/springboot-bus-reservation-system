package com.bus.bus.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bus.bus.model.busm;
import com.bus.bus.repository.busr;

@Service
public class buss {

    @Autowired
    private busr busRepository;

    public List<busm> getallbus() {
        return busRepository.findAll();
    }

    public Optional<busm> getbusbyid(int busid) {
       return busRepository.findById(busid);
    }

    public busm addbus(busm b) {
        return busRepository.save(b);
    }

    public boolean deletebus(int id) {
       Optional<busm> b=busRepository.findById(id);
       if(b.isPresent()){
        busRepository.deleteById(id);
        return true;
       }
       return false;
    }
    
}

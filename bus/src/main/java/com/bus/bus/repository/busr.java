package com.bus.bus.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.bus.bus.model.busm;

public interface busr extends JpaRepository<busm, Integer> {
    
    List<busm> findByAdmin_Id(int adminId);
    
}

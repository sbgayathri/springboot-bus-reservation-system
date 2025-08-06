package com.bus.bus.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.bus.bus.model.userm;

public interface adminr extends JpaRepository<userm, Integer> {
    
    // Find users with admin role
    @Query("SELECT u FROM userm u WHERE u.role = 'ADMIN'")
    List<userm> findAllAdmins();
    
}

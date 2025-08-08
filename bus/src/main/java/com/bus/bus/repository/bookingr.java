package com.bus.bus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bus.bus.model.bookingm;

public interface bookingr extends JpaRepository<bookingm, Integer> {

    List<bookingm> findByBus_Id(int busId);
    List<bookingm> findByUsers_Id(int userId);
    
}

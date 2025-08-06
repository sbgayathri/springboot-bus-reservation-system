package com.bus.bus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.bus.bus.model.bookingm;
import com.bus.bus.model.userm;

public interface bookingr extends JpaRepository<bookingm, Integer> {

    // Custom queries to match your entity relationships
    @Query("SELECT b FROM bookingm b WHERE b.bus.id = :busid")
    List<bookingm> findByBusid(@Param("busid") int busid);
    
    @Query("SELECT b FROM bookingm b WHERE b.users.id = :userid")
    List<bookingm> findByUsersId(@Param("userid") int userid);
    
    // Alternative method name for backward compatibility
    @Query("SELECT b FROM bookingm b WHERE b.users.id = :userid")
    List<bookingm> findByUserid(@Param("userid") int userid);
}

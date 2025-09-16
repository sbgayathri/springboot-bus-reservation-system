
package com.bus.bus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.bus.bus.model.userm;

public interface userr extends JpaRepository<userm,Integer>{
       Optional<userm> findByEmail(String email);
       List<userm> findByRole(String role);
       @Query("SELECT b.users FROM bookingm b WHERE b.bus.id=:busid")
       List<userm> finduserbybusid(int busid);
       boolean existsByEmail(String email);
}

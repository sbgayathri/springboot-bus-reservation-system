package com.bus.bus.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bus.bus.model.bookingm;
import com.bus.bus.model.userm;
import com.bus.bus.repository.userr;
import com.bus.bus.service.bookings;

@RestController
@RequestMapping("/api/bookings")
public class bookingc {
  @Autowired
  private bookings bss;
  
  @Autowired
  private userr userRepo;
  
  @PostMapping("/book")
  public ResponseEntity<String> bookbus(@RequestBody Map<String, Object> request){
    try {
      // Get current user from JWT
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      String email = auth.getName();
      userm user = userRepo.findByEmail(email).orElse(null);
      
      if (user == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
      }
      
      int busId = (Integer) request.get("busId");
      int seatsToBook = (Integer) request.get("seatsToBook");
      
      return bss.bookbus(busId, user.getId(), seatsToBook);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Booking failed: " + e.getMessage());
    }
  }
  
  @GetMapping("/user/{userid}")
  public ResponseEntity<List<bookingm>> getbookingbyuser(@PathVariable int userid){
    List<bookingm> books=bss.getbookingbyuser(userid);
    return ResponseEntity.ok(books);
  }
  
  @GetMapping("/bus/{busId}")
  public ResponseEntity<List<bookingm>> getBookingsForBus(@PathVariable int busId) {
    List<bookingm> bookings = bss.getBookingsForBus(busId);
    return ResponseEntity.ok(bookings);
  }
  
  @DeleteMapping("/cancel/{bookid}")
  public ResponseEntity<Void> cancel(@PathVariable int bookid){
    boolean c=bss.cancel(bookid);
    if(c){
        return ResponseEntity.noContent().build();
    }
    return ResponseEntity.notFound().build();
  }
    
}

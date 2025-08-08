package com.bus.bus.controller;

import java.util.List;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bus.bus.model.bookingm;
import com.bus.bus.model.busm;
import com.bus.bus.model.userm;
import com.bus.bus.repository.bookingr;
import com.bus.bus.repository.busr;
import com.bus.bus.repository.userr;
import com.bus.bus.service.bookings;
import com.bus.bus.service.users;
@RestController
@RequestMapping("/api/user")
public class userc {
      @Autowired
      private busr br;
      @Autowired 
      private bookingr bkr;
      @Autowired
      private bookings books;
      @Autowired
      private users us;
      @Autowired
      private userr ur;
     
    @GetMapping("/buses")
    public ResponseEntity<List<busm>> getallbus(){
      System.out.println("🚌 Getting all buses for user...");
      try {
        List<busm> b=br.findAll();
        System.out.println("✅ Found " + b.size() + " buses");
        for (busm bus : b) {
          System.out.println("   Bus: " + bus.getBusnum() + " from " + bus.getSource() + " to " + bus.getDestination());
        }
        return ResponseEntity.ok(b);
      } catch (Exception e) {
        System.err.println("❌ Error fetching buses: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).body(null);
      }
    }
    @PostMapping("/book/{busid}/user/{userid}")
    public ResponseEntity<String> bookbus(@PathVariable int busid,@PathVariable int userid,@RequestParam(defaultValue = "1") int seatsToBook){
      return  books.bookbus(busid, userid, seatsToBook);
    }
    @GetMapping("/bookings/{userid}")
    public ResponseEntity<List<bookingm>> bookingbyuser(@PathVariable int userid){
          Optional<userm> u=ur.findById(userid);
          if(u.isEmpty()){
            return ResponseEntity.notFound().build();
          }
          List<bookingm> bom=bkr.findByUsers_Id(userid);
          return ResponseEntity.ok(bom);
    }
    @PutMapping("/update/{userid}")
    public ResponseEntity<String> updateprofile(@PathVariable int userid,@RequestBody userm u){
      return us.updateprofile(userid,u);
    }

    @PostMapping("/cancel/{bookingid}")
    public ResponseEntity<String> cancelbooking(@PathVariable int bookingid){
      boolean success = books.cancel(bookingid);
      if(success){
        return ResponseEntity.ok("Booking cancelled successfully");
      }
      return ResponseEntity.badRequest().body("Booking not found or cancellation failed");
    }

    
    
}

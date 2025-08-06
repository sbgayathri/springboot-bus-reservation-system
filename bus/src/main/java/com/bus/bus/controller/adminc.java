package com.bus.bus.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bus.bus.model.bookingm;
import com.bus.bus.model.busm;
import com.bus.bus.model.userm;
import com.bus.bus.repository.bookingr;
import com.bus.bus.repository.busr;
import com.bus.bus.repository.userr;
import com.bus.bus.service.admins;
import com.bus.bus.service.bookings;

@RestController
@RequestMapping("/api/admin")
public class adminc {
    @Autowired 
    private busr br;
    @Autowired
    private bookingr bkr;
    @Autowired
    private userr ur;
    @Autowired
    private admins as;
    @PostMapping("/addbus")
    public ResponseEntity<?> addbus(@RequestBody busm b){
        busm s=br.save(b);
        return ResponseEntity.ok(s);
    }
   /*  @PutMapping("/update/{id}")
    public ResponseEntity<?> updatebus(@PathVariable int id,@RequestBody busm b){
        busm s=as.updatebus(id,b);
        if(s!=null){
            return ResponseEntity.ok(s);
        }
        return ResponseEntity.notFound().build();
    }*/
    @GetMapping("/allbooking/{busid}")
    public ResponseEntity<?>  getallbooking(@PathVariable int busid){
        List<bookingm> s=as.getBookingForbus(busid);
        if(s.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(s);
    }
     @GetMapping("/allbooking")
    public ResponseEntity<?> getAllBookings() {
        List<bookingm> allBookings = bkr.findAll();
        return ResponseEntity.ok(allBookings);
    }
    @GetMapping("/booki/{busid}")
    public ResponseEntity<?> getuserbybus(@PathVariable int busid){
        List<userm> u=as.getuserbybus(busid);
        if(u.isEmpty()){
            return ResponseEntity.status(404).body("no user booked");
        }
        return ResponseEntity.ok(u);
    }
   @PutMapping("/update/{adminid}")
   public ResponseEntity<?> updateadmin(@PathVariable int adminid,@RequestBody userm a){
    userm ad=as.updateadmin(adminid,a);
    if(ad==null){
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(ad);
   }
    
}

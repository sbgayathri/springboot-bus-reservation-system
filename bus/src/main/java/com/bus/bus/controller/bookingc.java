package com.bus.bus.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bus.bus.model.bookingm;
import com.bus.bus.service.bookings;

@RestController
@RequestMapping("/api/bookings")
public class bookingc {
  @Autowired
  private bookings bss;
  @PostMapping("/book")
  public ResponseEntity<String> bookbus(@RequestParam int userid,@RequestParam int busid){
    return bss.bookbus(busid,userid);
   
  }
  @GetMapping("/user/{userid}")
  public ResponseEntity<List<bookingm>> getbookingbyuser(@PathVariable int userid){
    List<bookingm> books=bss.getbookingbyuser(userid);
    return ResponseEntity.ok(books);
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

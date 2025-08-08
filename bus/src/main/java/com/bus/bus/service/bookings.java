package com.bus.bus.service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.bus.bus.model.bookingm;
import com.bus.bus.model.busm;
import com.bus.bus.model.userm;
import com.bus.bus.repository.bookingr;
import com.bus.bus.repository.busr;
import com.bus.bus.repository.userr;

@Service
public class bookings {

    @Autowired
    private bookingr br;
    @Autowired
    private userr ur;
    @Autowired
    private busr  bur;
    

    public List<bookingm> getbookingbyuser(int userid) {
         return  br.findByUsers_Id(userid);
    }

    public boolean cancel(int bookid) {
       Optional<bookingm> bookingOpt = br.findById(bookid);
       if(bookingOpt.isPresent()){
        bookingm booking = bookingOpt.get();
        busm bus = booking.getBus();
        
        // Restore the seats to the bus
        bus.setAvailableseats(bus.getAvailableseats() + booking.getSeatsBooked());
        bur.save(bus);
        
        // Delete the booking
        br.deleteById(bookid);
        return true;
       }
       return false;
    }

    public ResponseEntity<String> bookbus(int busid, int userid, int seatsToBook) {
        Optional<busm> bo=bur.findById(busid);
        Optional<userm> u=ur.findById(userid);
        if(bo.isEmpty()){
            return ResponseEntity.status(404).body("Bus not found");
        }
        if(u.isEmpty()){
            return ResponseEntity.status(404).body("User not found");
        }
        busm bus=bo.get();
        
       if(bus.getAvailableseats()<=0){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No seats available");
       }
       if(bus.getAvailableseats()<seatsToBook){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Not enough seats available. Only " + bus.getAvailableseats() + " seats left");
       }
       userm use=u.get();

        bookingm book=new bookingm();
        book.setBus(bus);
        book.setUsers(use);
        book.setBookingdate(LocalDateTime.now());
        book.setSeatsBooked(seatsToBook);
        br.save(book);
        bus.setAvailableseats(bus.getAvailableseats()-seatsToBook);
        bur.save(bus);
        return ResponseEntity.ok("Booking confirmed for " + seatsToBook + " seat(s)!");

    }

    public List<bookingm> getBookingsForBus(int busId) {
        return br.findByBus_Id(busId);
    }

    
}

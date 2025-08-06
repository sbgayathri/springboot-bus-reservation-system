package com.bus.bus.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class bookingm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @JsonFormat(pattern = "dd-MM-yyyy  hh:mm a")
    private LocalDateTime bookingdate;
    @ManyToOne
    @JoinColumn(name="user_id")
    private userm users;
    @ManyToOne
    @JoinColumn(name="bus_id")
    private busm bus;

    // Manual getters and setters as fallback for Lombok
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public LocalDateTime getBookingdate() { return bookingdate; }
    public void setBookingdate(LocalDateTime bookingdate) { this.bookingdate = bookingdate; }
    
    public userm getUsers() { return users; }
    public void setUsers(userm users) { this.users = users; }
    
    public busm getBus() { return bus; }
    public void setBus(busm bus) { this.bus = bus; }
}

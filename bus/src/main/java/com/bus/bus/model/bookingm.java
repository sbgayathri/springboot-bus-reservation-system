package com.bus.bus.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bookingdate;
    private int seatsBooked = 1; // Number of seats booked, default 1
    @ManyToOne
    @JoinColumn(name="user_id")
    @JsonIgnoreProperties({"bookings", "password"})
    private userm users;
    @ManyToOne
    @JoinColumn(name="bus_id")
    @JsonIgnoreProperties({"bookings", "admin"})
    private busm bus;
}

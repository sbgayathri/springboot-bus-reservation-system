package com.bus.bus.model;


import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Entity
@Data
public class busm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String busnum;
    private String source;
    private String destination;
    @JsonFormat(pattern="dd-MM-yyyy  hh:mm a")
    private LocalDateTime departuretime;
    @JsonFormat(pattern="dd-MM-yyyy  hh:mm a")
    private LocalDateTime arrivaltime;
    private int totalseats;
    private int availableseats;
    @ManyToOne
    @JoinColumn(name ="admin_id")
    @JsonIgnoreProperties({"booking", "bus", "password"})
    private userm admin;
    @OneToMany(mappedBy = "bus",cascade = CascadeType.ALL)
    @JsonIgnore
    private List<bookingm> booking;
}

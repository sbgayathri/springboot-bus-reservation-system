package com.bus.bus.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Entity
@Data
public class userm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String username;
    private String email;
    private String password;
    private String role;
    private String phone;
    @OneToMany(mappedBy = "users",cascade = CascadeType.ALL)
    @JsonIgnore
    private List<bookingm> booking;
    @OneToMany(mappedBy = "admin",cascade = CascadeType.ALL)
    @JsonIgnore
    private List<busm> bus;

    // Manual getters and setters as fallback for Lombok
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public List<bookingm> getBooking() { return booking; }
    public void setBooking(List<bookingm> booking) { this.booking = booking; }
    
    public List<busm> getBus() { return bus; }
    public void setBus(List<busm> bus) { this.bus = bus; }
}

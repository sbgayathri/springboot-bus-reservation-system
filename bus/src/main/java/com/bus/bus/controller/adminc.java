package com.bus.bus.controller;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;

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

@RestController
@RequestMapping("/api/admin")
public class adminc {
    @Autowired 
    private busr br;
    @Autowired
    private bookingr bkr;
    @Autowired
    private admins as;
    @Autowired
    private userr ur;
    @PostMapping("/addbus")
    public ResponseEntity<?> addbus(@RequestBody Map<String, Object> busData){
        try {
            System.out.println("🚌 Received bus data: " + busData);
            
            busm bus = new busm();
            bus.setBusnum((String) busData.get("busnum"));
            bus.setSource((String) busData.get("source"));
            bus.setDestination((String) busData.get("destination"));
            bus.setTotalseats((Integer) busData.get("totalseats"));
            bus.setAvailableseats((Integer) busData.get("availableseats"));
            
            // Parse datetime strings - handle null/empty cases
            if (busData.get("departuretime") != null && !((String) busData.get("departuretime")).trim().isEmpty()) {
                try {
                    bus.setDeparturetime(java.time.LocalDateTime.parse((String) busData.get("departuretime")));
                    System.out.println("✅ Departure time set: " + bus.getDeparturetime());
                } catch (Exception e) {
                    System.err.println("❌ Error parsing departure time: " + e.getMessage());
                    bus.setDeparturetime(null);
                }
            } else {
                System.out.println("⚠️ No departure time provided");
                bus.setDeparturetime(null);
            }
            
            if (busData.get("arrivaltime") != null && !((String) busData.get("arrivaltime")).trim().isEmpty()) {
                try {
                    bus.setArrivaltime(java.time.LocalDateTime.parse((String) busData.get("arrivaltime")));
                    System.out.println("✅ Arrival time set: " + bus.getArrivaltime());
                } catch (Exception e) {
                    System.err.println("❌ Error parsing arrival time: " + e.getMessage());
                    bus.setArrivaltime(null);
                }
            } else {
                System.out.println("⚠️ No arrival time provided");
                bus.setArrivaltime(null);
            }
            
            // Set admin relationship
            if (busData.get("adminId") != null) {
                int adminId = (Integer) busData.get("adminId");
                userm admin = ur.findById(adminId).orElse(null);
                if (admin != null && "ADMIN".equals(admin.getRole())) {
                    bus.setAdmin(admin);
                } else {
                    return ResponseEntity.badRequest().body("Invalid admin ID");
                }
            }
            
            busm savedBus = br.save(bus);
            System.out.println("✅ Bus saved successfully with ID: " + savedBus.getId());
            return ResponseEntity.ok(savedBus);
            
        } catch (Exception e) {
            System.err.println("❌ Error adding bus: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error adding bus: " + e.getMessage());
        }
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
     @GetMapping("/bookings")
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

   @GetMapping("/buses/{adminId}")
   public ResponseEntity<?> getAdminBuses(@PathVariable int adminId) {
       System.out.println("🚌 Getting buses for admin ID: " + adminId);
       try {
           List<busm> adminBuses = br.findByAdmin_Id(adminId);
           System.out.println("✅ Found " + adminBuses.size() + " buses for admin " + adminId);
           return ResponseEntity.ok(adminBuses);
       } catch (Exception e) {
           System.err.println("❌ Error fetching admin buses: " + e.getMessage());
           e.printStackTrace();
           return ResponseEntity.status(500).body("Error fetching admin buses: " + e.getMessage());
       }
   }

   @GetMapping("/buses")
   public ResponseEntity<List<busm>> getAllBuses() {
       System.out.println("🚌 Getting all buses for admin...");
       try {
           List<busm> allBuses = br.findAll();
           System.out.println("✅ Found " + allBuses.size() + " buses for admin");
           return ResponseEntity.ok(allBuses);
       } catch (Exception e) {
           System.err.println("❌ Error fetching admin buses: " + e.getMessage());
           e.printStackTrace();
           return ResponseEntity.status(500).body(null);
       }
   }
   
   @PostMapping("/create-test-buses")
   public ResponseEntity<?> createTestBuses() {
       try {
           // Find any admin user to assign buses to
           List<userm> admins = ur.findByRole("ADMIN");
           if (admins.isEmpty()) {
               return ResponseEntity.badRequest().body("No admin users found. Create an admin first.");
           }
           
           userm admin = admins.get(0); // Use the first admin
           
           // Create test buses
           busm[] testBuses = {
               createBus("BUS001", "Chennai", "Bangalore", "2025-08-08T08:00:00", "2025-08-08T14:00:00", 40, admin),
               createBus("BUS002", "Bangalore", "Chennai", "2025-08-08T09:00:00", "2025-08-08T15:00:00", 35, admin),
               createBus("BUS003", "Chennai", "Coimbatore", "2025-08-08T10:00:00", "2025-08-08T16:00:00", 30, admin),
               createBus("BUS004", "Coimbatore", "Chennai", "2025-08-08T11:00:00", "2025-08-08T17:00:00", 45, admin),
               createBus("BUS005", "Bangalore", "Mysore", "2025-08-08T12:00:00", "2025-08-08T18:00:00", 25, admin)
           };
           
           List<busm> savedBuses = new ArrayList<>();
           for (busm bus : testBuses) {
               savedBuses.add(br.save(bus));
           }
           
           System.out.println("🏗️ Created " + savedBuses.size() + " test buses");
           return ResponseEntity.ok(Map.of("message", "Created " + savedBuses.size() + " test buses", "buses", savedBuses));
       } catch (Exception e) {
           System.err.println("❌ Error creating test buses: " + e.getMessage());
           e.printStackTrace();
           return ResponseEntity.status(500).body("Error creating test buses: " + e.getMessage());
       }
   }
   
   private busm createBus(String busnum, String source, String destination, String departureTime, String arrivalTime, int totalSeats, userm admin) {
       busm bus = new busm();
       bus.setBusnum(busnum);
       bus.setSource(source);
       bus.setDestination(destination);
       bus.setDeparturetime(java.time.LocalDateTime.parse(departureTime));
       bus.setArrivaltime(java.time.LocalDateTime.parse(arrivalTime));
       bus.setTotalseats(totalSeats);
       bus.setAvailableseats(totalSeats);
       bus.setAdmin(admin);
       return bus;
   }
    
}

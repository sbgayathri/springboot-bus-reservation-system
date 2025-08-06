package com.bus.bus.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bus.bus.model.busm;
import com.bus.bus.service.buss;

@RestController
@RequestMapping("/api")
public class busc {
    @Autowired
    private buss bs;
    @GetMapping("/buses")
    public ResponseEntity<List<busm>> getallbus(){
        return new ResponseEntity<>(bs.getallbus(),HttpStatus.OK);
    }
    @GetMapping("/bus/{busid}")
    public ResponseEntity<busm> getbusbyid(@PathVariable int busid){
           Optional<busm> b = bs.getbusbyid(busid);
           if(b.isEmpty()){
               return new ResponseEntity<>(HttpStatus.NOT_FOUND);
           }
           return new ResponseEntity<>(b.get(), HttpStatus.OK);
    }
    @PostMapping("/add")
    public ResponseEntity<busm> addbus(@RequestBody busm b){
        busm addbus=bs.addbus(b);
        return new ResponseEntity<>(addbus,HttpStatus.CREATED);
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletebus(@PathVariable int id){
           boolean de=bs.deletebus(id);
           if(de){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
           }
           return ResponseEntity.notFound().build();
    }
    
}

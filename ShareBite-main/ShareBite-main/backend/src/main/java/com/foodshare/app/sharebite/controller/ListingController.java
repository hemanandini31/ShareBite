package com.foodshare.app.sharebite.controller;

import com.foodshare.app.sharebite.model.Listing;
import com.foodshare.app.sharebite.payload.request.ListingRequest;
import com.foodshare.app.sharebite.security.services.UserDetailsImpl;
import com.foodshare.app.sharebite.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
@RestController
@RequestMapping("/api/listings")
public class ListingController {

    @Autowired
    private ListingService listingService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<?> createListing(
            @Valid @RequestBody ListingRequest listingRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long donorId = userDetails.id();
            Listing newListing = listingService.createListing(listingRequest, donorId);
            return new ResponseEntity<>(newListing, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating listing: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<?> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody ListingRequest listingRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Listing updatedListing = listingService.updateListing(id, listingRequest, userDetails.id());
            return ResponseEntity.ok(updatedListing);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating listing: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<?> deleteListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            listingService.deleteListing(id, userDetails.id());
            return ResponseEntity.ok("Listing deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error deleting listing: " + e.getMessage());
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Listing>> getAllAvailableListings() {
        List<Listing> listings = listingService.getAvailableListings();
        return ResponseEntity.ok(listings);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Listing> getListingById(@PathVariable Long id) {
        return listingService.getListingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-donations")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<List<Listing>> getListingsByCurrentDonor(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Listing> listings = listingService.getListingsByDonor(userDetails.id());
        return ResponseEntity.ok(listings);
    }
}
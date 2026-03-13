package com.foodshare.app.sharebite.service;

import com.foodshare.app.sharebite.model.Listing;
import com.foodshare.app.sharebite.payload.request.ListingRequest;
import com.foodshare.app.sharebite.repository.ListingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ListingServiceTest {

    @Mock
    private ListingRepository listingRepository;

    @InjectMocks
    private ListingService listingService;

    private ListingRequest sampleRequest;
    private final Long donorId = 1L;

    @BeforeEach
    void setUp() {
        sampleRequest = new ListingRequest();
        sampleRequest.setName("Organic Apples");
        sampleRequest.setDescription("A basket of fresh garden apples.");
        sampleRequest.setServings(10.0);
        sampleRequest.setType("Fruits");
        sampleRequest.setPhotoUrl("http://example.com/apples.jpg");
        sampleRequest.setLatitude(40.7128);
        sampleRequest.setLongitude(-74.0060);
        sampleRequest.setAddress("123 Orchard Lane");
        sampleRequest.setPhoneNumber("1234567890");
    }

    @Test
    void createListing_Success_WithCustomClaimTime() {
        // Arrange
        Instant customTime = Instant.now().plusSeconds(3600);
        sampleRequest.setClaimByTime(customTime);

        Listing savedListing = new Listing();
        savedListing.setId(100L);
        savedListing.setName(sampleRequest.getName());

        when(listingRepository.save(any(Listing.class))).thenReturn(savedListing);

        // Act
        Listing result = listingService.createListing(sampleRequest, donorId);

        // Assert
        assertNotNull(result);
        verify(listingRepository, times(1)).save(argThat(listing ->
                listing.getName().equals("Organic Apples") &&
                        listing.getDonorId().equals(donorId) &&
                        listing.getStatus().equals("AVAILABLE") &&
                        listing.getClaimByTime().equals(customTime)
        ));
    }

    @Test
    void createListing_Success_WithDefaultClaimTime() {
        // Arrange
        sampleRequest.setClaimByTime(null);
        when(listingRepository.save(any(Listing.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Listing result = listingService.createListing(sampleRequest, donorId);

        // Assert
        assertNotNull(result.getClaimByTime());
        // Should be approximately 24 hours from now
        assertTrue(result.getClaimByTime().isAfter(Instant.now().plusSeconds(23 * 3600)));
    }

    @Test
    void getAvailableListings_ReturnsList() {
        // Arrange
        Listing l1 = new Listing();
        l1.setStatus("AVAILABLE");
        when(listingRepository.findByStatus("AVAILABLE")).thenReturn(List.of(l1));

        // Act
        List<Listing> results = listingService.getAvailableListings();

        // Assert
        assertEquals(1, results.size());
        assertEquals("AVAILABLE", results.get(0).getStatus());
    }

    @Test
    void getListingById_Found() {
        // Arrange
        Listing listing = new Listing();
        listing.setId(10L);
        when(listingRepository.findById(10L)).thenReturn(Optional.of(listing));

        // Act
        Optional<Listing> result = listingService.getListingById(10L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(10L, result.get().getId());
    }

    @Test
    void getListingsByDonor_ReturnsDonorSpecificList() {
        // Arrange
        Listing donorListing = new Listing();
        donorListing.setDonorId(donorId);
        when(listingRepository.findByDonorId(donorId)).thenReturn(List.of(donorListing));

        // Act
        List<Listing> results = listingService.getListingsByDonor(donorId);

        // Assert
        assertFalse(results.isEmpty());
        assertEquals(donorId, results.get(0).getDonorId());
    }
}
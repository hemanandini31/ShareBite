package com.foodshare.app.sharebite.service;

import com.foodshare.app.sharebite.exception.ClaimProcessException;
import com.foodshare.app.sharebite.exception.ResourceNotFoundException;
import com.foodshare.app.sharebite.model.Claim;
import com.foodshare.app.sharebite.model.Listing;
import com.foodshare.app.sharebite.repository.ClaimRepository;
import com.foodshare.app.sharebite.repository.ListingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private ListingRepository listingRepository;

    @InjectMocks
    private ClaimService claimService;

    private Listing sampleListing;
    private Claim sampleClaim;

    private final Long donorId = 1L;
    private final Long recipientId = 2L;
    private final Long listingId = 10L;
    private final Long claimId = 100L;

    @BeforeEach
    void setUp() {

        sampleListing = new Listing();
        sampleListing.setId(listingId);
        sampleListing.setDonorId(donorId);
        sampleListing.setStatus("AVAILABLE");

        sampleClaim = new Claim();
        sampleClaim.setId(claimId);
        sampleClaim.setListingId(listingId);
        sampleClaim.setRecipientId(recipientId);
        sampleClaim.setStatus("PENDING_PICKUP");
    }

    // ===============================
    // claimListing() → OTP generation
    // ===============================

    @Test
    void claimListing_GeneratesOtpSuccessfully() {

        when(listingRepository.findById(listingId))
                .thenReturn(Optional.of(sampleListing));

        String result = claimService.claimListing(listingId, recipientId);

        assertNotNull(sampleListing.getClaimOtp());
        assertNotNull(sampleListing.getClaimOtpExpiry());

        assertEquals(
                "OTP sent to donor. Please verify OTP to claim.",
                result
        );

        verify(listingRepository, times(1)).save(sampleListing);
    }

    @Test
    void claimListing_ThrowsException_WhenListingNotAvailable() {

        sampleListing.setStatus("CLAIMED");

        when(listingRepository.findById(listingId))
                .thenReturn(Optional.of(sampleListing));

        assertThrows(ClaimProcessException.class, () ->
                claimService.claimListing(listingId, recipientId));
    }

    @Test
    void claimListing_ThrowsNotFound_WhenListingMissing() {

        when(listingRepository.findById(listingId))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                claimService.claimListing(listingId, recipientId));
    }

    // ====================================
    // verifyClaimOtp() → actual claim step
    // ====================================

    @Test
    void verifyClaimOtp_Success() {

        sampleListing.setClaimOtp("123456");
        sampleListing.setClaimOtpExpiry(Instant.now().plusSeconds(300));

        when(listingRepository.findById(listingId))
                .thenReturn(Optional.of(sampleListing));

        when(claimRepository.save(any(Claim.class)))
                .thenReturn(sampleClaim);

        Claim result = claimService.verifyClaimOtp(
                listingId,
                "123456",
                recipientId
        );

        assertNotNull(result);

        assertEquals("CLAIMED", sampleListing.getStatus());
        assertEquals(recipientId, sampleListing.getClaimerId());

        verify(listingRepository, times(1)).save(sampleListing);
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @Test
    void verifyClaimOtp_InvalidOtp() {

        sampleListing.setClaimOtp("123456");
        sampleListing.setClaimOtpExpiry(Instant.now().plusSeconds(300));

        when(listingRepository.findById(listingId))
                .thenReturn(Optional.of(sampleListing));

        assertThrows(ClaimProcessException.class, () ->
                claimService.verifyClaimOtp(listingId, "999999", recipientId));
    }

    // ===============================
    // fulfillClaim Tests
    // ===============================

    @Test
    void fulfillClaim_Success() {

        when(claimRepository.findById(claimId))
                .thenReturn(Optional.of(sampleClaim));

        when(listingRepository.findById(listingId))
                .thenReturn(Optional.of(sampleListing));

        when(claimRepository.save(any(Claim.class)))
                .thenReturn(sampleClaim);

        Claim result = claimService.fulfillClaim(claimId, donorId);

        assertEquals("FULFILLED", result.getStatus());
        assertNotNull(result.getFulfillmentTime());
        assertEquals("COMPLETED", sampleListing.getStatus());

        verify(listingRepository, times(1)).save(sampleListing);
    }

    @Test
    void fulfillClaim_ThrowsException_WhenNotDonor() {

        when(claimRepository.findById(claimId))
                .thenReturn(Optional.of(sampleClaim));

        when(listingRepository.findById(listingId))
                .thenReturn(Optional.of(sampleListing));

        assertThrows(ClaimProcessException.class, () ->
                claimService.fulfillClaim(claimId, recipientId));
    }

    // ===============================
    // cancelClaim Tests
    // ===============================

    @Test
    void cancelClaim_Success() {

        when(claimRepository.findById(claimId))
                .thenReturn(Optional.of(sampleClaim));

        when(listingRepository.findById(listingId))
                .thenReturn(Optional.of(sampleListing));

        when(claimRepository.save(any(Claim.class)))
                .thenReturn(sampleClaim);

        Claim result = claimService.cancelClaim(claimId, recipientId);

        assertEquals("AVAILABLE", sampleListing.getStatus());
        assertEquals("CANCELLED", result.getStatus());

        verify(listingRepository, times(1)).save(sampleListing);
    }

    @Test
    void cancelClaim_ThrowsException_WhenUnauthorized() {

        when(claimRepository.findById(claimId))
                .thenReturn(Optional.of(sampleClaim));

        when(listingRepository.findById(listingId))
                .thenReturn(Optional.of(sampleListing));

        assertThrows(ClaimProcessException.class, () ->
                claimService.cancelClaim(claimId, donorId));
    }
}
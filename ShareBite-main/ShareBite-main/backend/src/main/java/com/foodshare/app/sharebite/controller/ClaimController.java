package com.foodshare.app.sharebite.controller;

import com.foodshare.app.sharebite.exception.ClaimProcessException;
import com.foodshare.app.sharebite.exception.ResourceNotFoundException;
import com.foodshare.app.sharebite.model.Claim;
import com.foodshare.app.sharebite.security.services.UserDetailsImpl;
import com.foodshare.app.sharebite.service.ClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    @Autowired
    private ClaimService claimService;

    /**
     * Step 1: Initiate claim → Generate OTP
     */
    @PostMapping("/initiate/{listingId}")
    @PreAuthorize("hasAuthority('ROLE_RECIPIENT')")
    public ResponseEntity<?> initiateClaim(
            @PathVariable Long listingId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long recipientId = userDetails.id();

        try {
            String message = claimService.claimListing(listingId, recipientId);
            return ResponseEntity.ok(message);
        } catch (ClaimProcessException | ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Step 2: Verify OTP → Claim is created
     */
    @PostMapping("/verify-otp")
    @PreAuthorize("hasAuthority('ROLE_RECIPIENT')")
    public ResponseEntity<?> verifyClaimOtp(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        try {

            Long listingId = Long.parseLong(request.get("listingId"));
            String otp = request.get("otp");
            Long recipientId = userDetails.id();

            Claim verifiedClaim = claimService.verifyClaimOtp(listingId, otp, recipientId);

            return ResponseEntity.ok(verifiedClaim);

        } catch (ClaimProcessException | ResourceNotFoundException e) {

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get claims for recipient
     */
    @GetMapping("/my-claims")
    @PreAuthorize("hasAuthority('ROLE_RECIPIENT')")
    public ResponseEntity<List<Claim>> getClaimsByRecipient(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long recipientId = userDetails.id();
        List<Claim> claims = claimService.getClaimsByRecipient(recipientId);
        return ResponseEntity.ok(claims);
    }

    /**
     * Cancel claim
     */
    @PutMapping("/cancel/{claimId}")
    @PreAuthorize("hasAuthority('ROLE_RECIPIENT')")
    public ResponseEntity<?> cancelClaim(
            @PathVariable Long claimId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long recipientId = userDetails.id();

        try {
            Claim cancelledClaim = claimService.cancelClaim(claimId, recipientId);
            return ResponseEntity.ok(cancelledClaim);
        } catch (ClaimProcessException | ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Claims visible to donor
     */
    @GetMapping("/donated-claims")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<List<Claim>> getClaimsForDonorView(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long donorId = userDetails.id();
        List<Claim> claims = claimService.getClaimsForDonorView(donorId);
        return ResponseEntity.ok(claims);
    }

    /**
     * Donor confirms pickup → Fulfill claim
     */
    @PutMapping("/fulfill/{claimId}")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<?> fulfillClaim(
            @PathVariable Long claimId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long donorId = userDetails.id();

        try {
            Claim fulfilledClaim = claimService.fulfillClaim(claimId, donorId);
            return ResponseEntity.ok(fulfilledClaim);
        } catch (ClaimProcessException | ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
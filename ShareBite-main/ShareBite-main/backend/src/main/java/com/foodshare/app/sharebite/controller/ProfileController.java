package com.foodshare.app.sharebite.controller;

import com.foodshare.app.sharebite.model.Profile;
import com.foodshare.app.sharebite.service.ProfileService;
import com.foodshare.app.sharebite.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Profile> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Profile profile = profileService.getProfileByUserId(userDetails.id());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Profile> updateMyProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Profile profileData) {

        Long userId = userDetails.id();
        Profile updatedProfile = profileService.updateProfile(userId, profileData);
        return ResponseEntity.ok(updatedProfile);
    }
}
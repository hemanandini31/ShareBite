package com.foodshare.app.sharebite.service;

import com.foodshare.app.sharebite.model.Profile;
import com.foodshare.app.sharebite.repository.ProfileRepository;
import com.foodshare.app.sharebite.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    public Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user ID: " + userId));
    }

    public Profile updateProfile(Long userId, Profile updatedProfileData) {
        Profile profile = getProfileByUserId(userId);

        if (updatedProfileData.getName() != null) {
            profile.setName(updatedProfileData.getName());
        }
        if (updatedProfileData.getPhoneNumber() != null) {

            profile.setPhoneNumber(updatedProfileData.getPhoneNumber());
        }

        return profileRepository.save(profile);
    }
}
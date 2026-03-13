package com.foodshare.app.sharebite.service;

import com.foodshare.app.sharebite.exception.ResourceNotFoundException;
import com.foodshare.app.sharebite.model.Profile;
import com.foodshare.app.sharebite.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    @InjectMocks
    private ProfileService profileService;

    private Profile existingProfile;
    private final Long userId = 101L;

    @BeforeEach
    void setUp() {
        existingProfile = new Profile();
        existingProfile.setId(1L);
        existingProfile.setName("John Doe");
        existingProfile.setPhoneNumber("1234567890");
    }

    @Test
    void getProfileByUserId_Success() {
        // Arrange
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(existingProfile));

        // Act
        Profile result = profileService.getProfileByUserId(userId);

        // Assert
        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        verify(profileRepository, times(1)).findByUserId(userId);
    }

    @Test
    void getProfileByUserId_ThrowsException_WhenNotFound() {
        // Arrange
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            profileService.getProfileByUserId(userId);
        });

        assertTrue(exception.getMessage().contains("Profile not found"));
    }

    @Test
    void updateProfile_FullUpdate_Success() {
        // Arrange
        Profile updateData = new Profile();
        updateData.setName("Jane Smith");
        updateData.setPhoneNumber("9876543210");

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(existingProfile));
        when(profileRepository.save(any(Profile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Profile result = profileService.updateProfile(userId, updateData);

        // Assert
        assertEquals("Jane Smith", result.getName());
        assertEquals("9876543210", result.getPhoneNumber());
        verify(profileRepository).save(existingProfile);
    }

    @Test
    void updateProfile_PartialUpdate_OnlyPhoneNumber() {
        // Arrange
        Profile updateData = new Profile();
        updateData.setPhoneNumber("5556667777"); // Name is null in update object

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(existingProfile));
        when(profileRepository.save(any(Profile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Profile result = profileService.updateProfile(userId, updateData);

        // Assert
        assertEquals("John Doe", result.getName()); // Should remain unchanged
        assertEquals("5556667777", result.getPhoneNumber()); // Should be updated
    }

    @Test
    void updateProfile_PartialUpdate_OnlyName() {
        // Arrange
        Profile updateData = new Profile();
        updateData.setName("New Brand Name"); // Phone is null in update object

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(existingProfile));
        when(profileRepository.save(any(Profile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Profile result = profileService.updateProfile(userId, updateData);

        // Assert
        assertEquals("New Brand Name", result.getName());
        assertEquals("1234567890", result.getPhoneNumber()); // Should remain unchanged
    }
}
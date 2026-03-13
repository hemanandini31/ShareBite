package com.foodshare.app.sharebite.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.Instant;

@Data
public class ListingRequest {

    @NotBlank(message = "Food name is required")
    private String name;

    private String description;

    @NotNull(message = "Servings quantity is required")
    @Positive(message = "Servings must be a positive number.")
    private Double servings;

    @NotBlank(message = "Food type is required")
    private String type;

    @NotBlank(message = "Photo URL is required")
    private String photoUrl; // URL from cloud storage (e.g., S3)

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Donor phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format. Must be 10-15 digits.")
    private String phoneNumber;

    @NotNull(message = "Claim by time is required")
    private Instant claimByTime;
}
package com.foodshare.app.sharebite.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Food name is required")
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "Servings quantity is required")
    @Positive(message = "Servings must be a positive number")
    @Column(nullable = false)
    private Double servings;

    @NotBlank(message = "Food type is required")
    private String type;

    @NotBlank(message = "Photo is required")
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String photoUrl;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotBlank(message = "Address is required")
    @Column(length = 500)
    private String address;

    @NotBlank(message = "Donor phone number is required")
    @Pattern(
        regexp = "^[0-9]{10}$|^\\+[0-9]{1,3}[0-9]{10}$",
        message = "Invalid phone number format"
    )
    private String phoneNumber;

    @Column(nullable = false)
    @Builder.Default
    private String status = "AVAILABLE";

    private Instant claimByTime;

    @Column(name = "donor_id", nullable = false)
    private Long donorId;

    private Long claimerId;

    /*
        NEW FIELDS FOR OTP CLAIM VERIFICATION
    */

    @Column(length = 6)
    private String claimOtp;

    private Instant claimOtpExpiry;

    @Builder.Default
    private Boolean recipientSigned = false;

    @Builder.Default
    private Boolean donorVerified = false;

    @Transient
    private String donorName;

    @Transient
    private String donorEmail;
}
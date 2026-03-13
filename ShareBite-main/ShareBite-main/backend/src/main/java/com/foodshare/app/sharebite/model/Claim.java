package com.foodshare.app.sharebite.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Entity
@Table(name = "claims")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Listing ID is required for a claim")
    @Column(name = "listing_id", nullable = false)
    private Long listingId;

    @NotNull(message = "Recipient ID is required")
    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING_PICKUP";

    @Column(nullable = false)
    @Builder.Default
    private Instant claimTime = Instant.now();

    @Column(name = "fulfillment_time")
    private Instant fulfillmentTime;

    @Transient
    private String recipientName;

    @Transient
    private String recipientPhone;
}
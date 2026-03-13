package com.foodshare.app.sharebite.repository;

import com.foodshare.app.sharebite.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing,Long> {

    List<Listing> findByDonorId(Long donorId);

    List<Listing> findByStatus(String status);
}

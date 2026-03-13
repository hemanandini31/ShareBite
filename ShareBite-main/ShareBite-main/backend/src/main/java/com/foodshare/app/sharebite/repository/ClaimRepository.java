package com.foodshare.app.sharebite.repository;

import com.foodshare.app.sharebite.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ClaimRepository extends JpaRepository<Claim,Long> {


    List<Claim> findByRecipientId(Long recipientId);


    List<Claim> findByListingIdIn(List<Long> listingIds);

}
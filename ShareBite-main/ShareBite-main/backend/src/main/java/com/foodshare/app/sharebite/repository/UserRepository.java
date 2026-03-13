package com.foodshare.app.sharebite.repository;

import com.foodshare.app.sharebite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {


    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);
}

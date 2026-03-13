package com.foodshare.app.sharebite.security.services;

import com.foodshare.app.sharebite.model.User;
import com.foodshare.app.sharebite.model.Profile;
import com.foodshare.app.sharebite.repository.ProfileRepository;
import com.foodshare.app.sharebite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.DisabledException;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    ProfileRepository profileRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));

        if (!user.getIsEmailVerified()) {
            throw new DisabledException("Your email is not verified. Please check your inbox for the OTP.");
        }

        Optional<Profile> profileOptional = profileRepository.findByUserId(user.getId());
        Profile profile = profileOptional.orElse(null);

        return UserDetailsImpl.build(user, profile);
    }
}
package com.foodshare.app.sharebite.controller;

import com.foodshare.app.sharebite.exception.ResourceNotFoundException;
import com.foodshare.app.sharebite.model.Profile;
import com.foodshare.app.sharebite.model.User;
import com.foodshare.app.sharebite.payload.request.LoginRequest;
import com.foodshare.app.sharebite.payload.request.RegisterRequest;
import com.foodshare.app.sharebite.payload.response.JwtResponse;
import com.foodshare.app.sharebite.repository.ProfileRepository;
import com.foodshare.app.sharebite.repository.UserRepository;
import com.foodshare.app.sharebite.security.jwt.JwtUtils;
import com.foodshare.app.sharebite.security.services.UserDetailsImpl;
import com.foodshare.app.sharebite.service.EmailService;
import com.foodshare.app.sharebite.service.EmailService.EmailType;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Random;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ProfileRepository profileRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Long userId;
            String userRole;
            String userEmail;
            Object principal = authentication.getPrincipal();

            if (principal instanceof UserDetailsImpl userPrincipal) {
                userId = userPrincipal.id();
                String authority = userPrincipal.getAuthorities().iterator().next().getAuthority();
                userRole = authority.startsWith("ROLE_") ? authority.substring(5) : authority;
                userEmail = userPrincipal.getUsername();
            } else if (principal instanceof UserDetails userPrincipal) {
                User user = userRepository.findByEmail(userPrincipal.getUsername())
                        .orElseThrow(() -> new RuntimeException("Error: User not found after authentication."));
                userId = user.getId();
                userRole = user.getRole();
                userEmail = user.getEmail();
            } else {
                throw new RuntimeException("Unrecognized principal type after authentication.");
            }

            String jwt = jwtUtils.generateJwtToken(userId);

            Profile profile = profileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));
            String name = profile.getName();

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userId,
                    userEmail,
                    userRole,
                    name));

        } catch (org.springframework.security.authentication.DisabledException e) {
            return ResponseEntity.status(401).body("Error: Your email is not verified. Please check your inbox for the OTP.");
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(401).body("Error: Invalid email or password.");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        if (profileRepository.existsByPhoneNumber(registerRequest.getPhoneNumber())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Phone number is already registered!");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(encoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole().toUpperCase());

        User savedUser = userRepository.save(user);

        Profile profile = new Profile();
        profile.setName(registerRequest.getName());
        profile.setPhoneNumber(registerRequest.getPhoneNumber());
        profile.setUser(savedUser);

        profileRepository.save(profile);

        savedUser = generateAndSaveOtp(savedUser);
        emailService.sendOtpEmail(savedUser.getEmail(), savedUser.getOtpCode(), EmailType.REGISTRATION);

        return ResponseEntity.ok("User registered successfully. Please check your email for the verification code.");
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getIsEmailVerified()) {
            return ResponseEntity.ok("Email is already verified. No new OTP needed.");
        }

        user = generateAndSaveOtp(user);
        emailService.sendOtpEmail(user.getEmail(), user.getOtpCode(), EmailType.REGISTRATION);

        return ResponseEntity.ok("Verification OTP sent to " + user.getEmail() + ". Check your inbox!");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpSubmitted = request.get("otp");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getIsEmailVerified()) {
            return ResponseEntity.ok("Email is already verified.");
        }
        if (user.getOtpCode() == null || !otpSubmitted.equals(user.getOtpCode())) {
            return ResponseEntity.badRequest().body("Invalid or missing OTP code.");
        }

        if (user.getOtpExpiryTime().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body("OTP code has expired. Please request a new one.");
        }

        user.setIsEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);

        return ResponseEntity.ok("Email verified successfully! You can now log in.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("Error: User not found with email: " + email);
        }

        user = generateAndSaveOtp(user);
        emailService.sendOtpEmail(user.getEmail(), user.getOtpCode(), EmailType.PASSWORD_RESET);

        return ResponseEntity.ok("Password reset OTP sent to your email.");
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("Error: User not found.");
        }

        if (user.getOtpCode() == null || !otp.equals(user.getOtpCode())) {
            return ResponseEntity.badRequest().body("Invalid OTP code.");
        }
        if (user.getOtpExpiryTime().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body("OTP has expired.");
        }

        return ResponseEntity.ok("OTP verified. You may now reset your password.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("Error: User not found.");
        }

        if (user.getOtpCode() == null || !otp.equals(user.getOtpCode()) || user.getOtpExpiryTime().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body("Session expired or invalid. Please try again.");
        }

        user.setPasswordHash(encoder.encode(newPassword));
        user.setOtpCode(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password has been reset successfully.");
    }

    private User generateAndSaveOtp(User user) {
        String otp = String.format("%06d", new Random().nextInt(1000000));
        Instant expiryTime = Instant.now().plusSeconds(5 * 60);
        user.setOtpCode(otp);
        user.setOtpExpiryTime(expiryTime);
        return userRepository.save(user);
    }
}
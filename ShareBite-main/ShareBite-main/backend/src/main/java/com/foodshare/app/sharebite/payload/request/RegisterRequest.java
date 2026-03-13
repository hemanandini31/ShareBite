package com.foodshare.app.sharebite.payload.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$|^\\+[0-9]{1,3}[0-9]{10}$")
    private String phoneNumber;

    @NotBlank
    private String role; // Expects "DONOR" or "RECIPIENT"
}
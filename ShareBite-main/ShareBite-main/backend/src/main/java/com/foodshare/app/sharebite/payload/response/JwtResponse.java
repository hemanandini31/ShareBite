package com.foodshare.app.sharebite.payload.response;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String role;
    private String name;

    public JwtResponse(String accessToken, Long id, String email, String role, String name) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.role = role;
        this.name= name;
    }
}
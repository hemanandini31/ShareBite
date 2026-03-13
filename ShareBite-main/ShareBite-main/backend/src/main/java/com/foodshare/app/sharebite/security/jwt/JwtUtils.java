package com.foodshare.app.sharebite.security.jwt;

//import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${sharebite.app.jwtSecret}")
    private String jwtSecret;

    @Value("${sharebite.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Generate JWT
    public String generateJwtToken(Long userId) {

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(new Date())
                .expiration(new Date(new Date().getTime() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // Extract userId
    public String getUserIdStringFromJwtToken(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Validate token
    public boolean validateJwtToken(String authToken) {

        try {

            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);

            return true;

        } catch (MalformedJwtException e) {

            System.out.println("Invalid JWT token: " + e.getMessage());

        } catch (ExpiredJwtException e) {

            System.out.println("JWT token expired: " + e.getMessage());

        } catch (UnsupportedJwtException e) {

            System.out.println("JWT unsupported: " + e.getMessage());

        } catch (IllegalArgumentException e) {

            System.out.println("JWT claims empty: " + e.getMessage());
        }

        return false;
    }
}
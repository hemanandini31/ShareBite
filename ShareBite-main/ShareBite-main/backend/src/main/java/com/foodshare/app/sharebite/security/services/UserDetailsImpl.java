package com.foodshare.app.sharebite.security.services;

import com.foodshare.app.sharebite.model.User;
import com.foodshare.app.sharebite.model.Profile;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public record UserDetailsImpl(
        Long id,
        String email,
        String name,

        @JsonIgnore
        String password,

        Collection<? extends GrantedAuthority> authorities
) implements UserDetails {

    public static UserDetailsImpl build(User user, Profile profile) {

        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole()));

        String userName = (profile != null) ? profile.getName() : user.getEmail();

        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                userName,
                user.getPasswordHash(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserDetailsImpl user)) return false;
        return Objects.equals(id, user.id());
    }
}
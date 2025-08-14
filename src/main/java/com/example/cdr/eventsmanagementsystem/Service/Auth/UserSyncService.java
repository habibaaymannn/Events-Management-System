package com.example.cdr.eventsmanagementsystem.Service.Auth;

import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.cdr.eventsmanagementsystem.Model.User.Admin;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserSyncService {
    private final List<UserRoleHandler> handlers;

    @Transactional
    public <T extends BaseRoleEntity> T ensureUserExists(Class<T> type) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt)) {
            throw new RuntimeException("No authentication found");
        }
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String userId = jwt.getClaimAsString("sub");
        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");
        String userRole = getCurrentUserRole(authentication);

        log.info("Processing user sync for userId: {} with role: {}", userId, userRole);
        return handlers.stream()
                .filter(handler -> handler.supports(userRole))
                .findFirst()
                .map(handler -> {
                    BaseRoleEntity existingUser = handler.findUserById(userId);
                    if (existingUser != null) {
                        log.debug("Found existing user: {} with role: {}", userId, userRole);
                        return type.cast(existingUser);
                    }
                    BaseRoleEntity newUser = handler.createNewUser(userId, email, firstName, lastName);
                    return type.cast(newUser);
                })
                .orElseThrow(() -> new RuntimeException("Unsupported user role: " + userRole));
    }
    public String getCurrentUserRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(auth -> auth.getAuthority().replace("ROLE_","").toLowerCase())
                .findFirst().orElse(null);
    }

    public BaseRoleEntity findExistingUser(String userId, String role) {
        UserRoleHandler handler = getHandlerForRole(role);
        return handler.findUserById(userId);
    }
    public <T extends BaseRoleEntity> UserRoleHandler<T> getHandlerForRole(String role) {
        return handlers.stream()
                .filter(handler -> handler.supports(role))
                .findFirst()
                .map(handler -> (UserRoleHandler<T>) handler)
                .orElseThrow(() -> new IllegalArgumentException("No handler found for role: " + role));
    }

    public BaseRoleEntity findUserById(String userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new RuntimeException("No authentication found");
        }
        String role = getCurrentUserRole(authentication);
        return findExistingUser(userId, role);
    }
    public List<UserRoleHandler> getHandlers() {
        return handlers;
    }
}
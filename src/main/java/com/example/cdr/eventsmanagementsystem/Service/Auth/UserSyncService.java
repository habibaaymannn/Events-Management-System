package com.example.cdr.eventsmanagementsystem.Service.Auth;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Objects;

/**
 * Ensures the current authenticated user exists in the system.
 * If not, creates a new user based on JWT claims.
 * @return The existing or newly created user entity
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class UserSyncService {
    private final List<UserRoleHandler> handlers;

    @Transactional
    public <T extends BaseRoleEntity> T ensureUserExists(Class<T> type) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (Objects.isNull(authentication) || !(authentication.getPrincipal() instanceof Jwt)) {
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
                    if (!Objects.isNull(existingUser)) {
                        log.debug("Found existing user: {} with role: {}", userId, userRole);
                        return type.cast(existingUser);
                    }
                    BaseRoleEntity newUser = handler.createNewUser(userId, email, firstName, lastName);
                    return type.cast(newUser);
                })
                .orElseThrow(() -> new RuntimeException("Unsupported user role: " + userRole));
    }
    public String getCurrentUserRole(Authentication authentication) {
        List<String> supportedRoles = List.of(
                "admin", "organizer", "service_provider", "venue_provider", "attendee"
        );
        return authentication.getAuthorities().stream()
                .map(auth -> auth.getAuthority().replace("ROLE_","").toLowerCase())
                .filter(supportedRoles::contains)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No supported user role found in authorities"));
    }
    public <T extends BaseRoleEntity> UserRoleHandler<T> getHandlerForRole(String role) {
        return handlers.stream()
                .filter(handler -> handler.supports(role))
                .findFirst()
                .map(handler -> (UserRoleHandler<T>) handler)
                .orElseThrow(() -> new IllegalArgumentException("No handler found for role: " + role));
    }
    public List<UserRoleHandler> getHandlers() {
        return handlers;
    }
}
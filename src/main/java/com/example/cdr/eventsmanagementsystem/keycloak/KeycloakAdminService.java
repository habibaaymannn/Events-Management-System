package com.example.cdr.eventsmanagementsystem.keycloak;

import jakarta.annotation.PreDestroy;
import jakarta.ws.rs.core.Response;
// import lombok.RequiredArgsConstructor; // <-- remove Lombok constructor
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.*;
import org.keycloak.representations.idm.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.PasswordResetResponse;
import java.util.Set;


@Service
public class KeycloakAdminService {

    private final KeycloakAdminProps props;
    private final Keycloak kc;

    private static final java.util.List<String> MANAGED =
        java.util.List.of("admin", "organizer", "attendee", "service_provider", "venue_provider");
    // If you want a display priority (optional):
    private static final java.util.List<String> ROLE_PRIORITY =
        java.util.List.of("admin", "organizer", "service_provider", "venue_provider", "attendee");
    // Single explicit constructor so Spring knows exactly what to use
    @Autowired
    public KeycloakAdminService(KeycloakAdminProps props) {
        this.props = props;

        KeycloakBuilder builder = KeycloakBuilder.builder()
                .serverUrl(props.getBaseUrl())            // e.g. http://keycloak:8080 (in Docker)
                .realm(props.getRealm())                  // EMS-realm
                .clientId(props.getAdminClientId())       // spring-boot-app
                .grantType(OAuth2Constants.PASSWORD)      // use password grant as admin1
                .username(props.getAdminUsername())       // admin1
                .password(props.getAdminPassword());      // adminpass

        String secret = props.getAdminClientSecret();
        if (secret != null && !secret.isBlank()) {
            builder.clientSecret(secret);                 // confidential client secret
        }

        this.kc = builder.build();
    }

    @PreDestroy
    void close() {
        kc.close();
    }

    private RealmResource realm() {
        return kc.realm(props.getRealm());
    }

    // ---------- CREATE USER ----------
    public String createUser(String username, String email, String firstName, String lastName, String password, String realmRole) {
        UsersResource users = realm().users();

        UserRepresentation u = new UserRepresentation();
        u.setUsername(username);
        u.setEnabled(true);
        u.setEmail(email);
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setEmailVerified(props.isMarkEmailVerifiedOnCreate());

        Response r = users.create(u);
        if (r.getStatus() >= 300) {
            throw new RuntimeException("Keycloak create user failed: HTTP " + r.getStatus());
        }
        String userId = CreatedResponseUtil.getCreatedId(r);

        CredentialRepresentation cr = new CredentialRepresentation();
        cr.setType(CredentialRepresentation.PASSWORD);
        cr.setTemporary(props.isTemporaryPasswordOnCreate());
        cr.setValue(password);

        UserResource userRes = users.get(userId);
        userRes.resetPassword(cr);

        if (realmRole != null && !realmRole.isBlank()) {
            RoleRepresentation rr = realm().roles().get(realmRole).toRepresentation();
            userRes.roles().realmLevel().add(Collections.singletonList(rr));
        }
        return userId;
    }

    // ---------- UPDATE ROLE ----------


    // Return the first managed realm role the user currently has (with priority)
    public String resolveManagedRole(String userId) {
        UserResource u = realm().users().get(userId);
        Set<String> names = u.roles().realmLevel().listAll()
                .stream().map(RoleRepresentation::getName).collect(Collectors.toSet());
        for (String r : ROLE_PRIORITY) {
            if (names.contains(r)) return r;
        }
        // no managed role found — null or a default you prefer:
        return null;
    }
    public void updateUserRole(String userId, String targetRealmRole) {
        UserResource u = realm().users().get(userId);
        List<RoleRepresentation> current = u.roles().realmLevel().listAll();

        // Only remove roles that you manage
        List<RoleRepresentation> managed = current.stream()
                .filter(rr -> isManagedRole(rr.getName()))
                .collect(Collectors.toList());
        if (!managed.isEmpty()) {
            u.roles().realmLevel().remove(managed);
        }

        if (targetRealmRole != null && !targetRealmRole.isBlank()) {
            RoleRepresentation rr = realm().roles().get(targetRealmRole).toRepresentation();
            u.roles().realmLevel().add(Collections.singletonList(rr));
        }
    }

    private boolean isManagedRole(String name) {
        return List.of("admin", "organizer", "attendee", "service_provider", "venue_provider").contains(name);
    }

    // ---------- ACTIVATE / DEACTIVATE ----------
    public void setEnabled(String userId, boolean enabled) {
        UserResource u = realm().users().get(userId);
        UserRepresentation rep = u.toRepresentation();
        rep.setEnabled(enabled);
        u.update(rep);
    }

// ---------- RESET PASSWORD (send email action) ----------
public PasswordResetResponse sendResetPasswordAndOptions(String userId) {
    var realm = props.getRealm();

    // ✅ Use your existing helper; do NOT call a non-existent keycloak()
    UsersResource users = realm().users();

    // ✅ Use the simple, stable overload that only takes List<String>
    users.get(userId).executeActionsEmail(java.util.List.of("UPDATE_PASSWORD"));

    // --- 2) Build a "Forgot password" ENTRY link (no token needed) ---
    // This lands on Keycloak login page for your client; the user clicks "Forgot password?"
    String publicBase = trimTrailingSlash(props.getPublicBaseUrl());
    String redirect   = urlEncode(props.getPostActionRedirectUri());
    String clientId   = props.getFrontendClientId();

    String forgotPasswordEntryUrl =
        publicBase + "/realms/" + realm + "/protocol/openid-connect/auth"
        + "?client_id=" + clientId
        + "&redirect_uri=" + redirect
        + "&response_type=code&scope=openid";

    // Optional: direct link to Account Console
    String accountUrl = publicBase + "/realms/" + realm + "/account";

    return new PasswordResetResponse(true, forgotPasswordEntryUrl, accountUrl);
}


    private static String trimTrailingSlash(String s) {
        if (s == null) return "";
        return s.endsWith("/") ? s.substring(0, s.length()-1) : s;
    }
    private static String urlEncode(String s) {
        try { return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8); }
        catch (Exception e) { return s; }
    }

    // ---------- DELETE ----------
    public void deleteUser(String userId) {
        realm().users().delete(userId);
    }

    // ---------- LIST ----------
    public List<UserRepresentation> listUsers(int page, int size) {
        return realm().users().list(page * size, size);
    }

    // ---------- FIND ----------
    public Optional<UserRepresentation> findById(String userId) {
        try {
            return Optional.of(realm().users().get(userId).toRepresentation());
        } catch (Exception e) {
            return Optional.empty();
        }
    }


}

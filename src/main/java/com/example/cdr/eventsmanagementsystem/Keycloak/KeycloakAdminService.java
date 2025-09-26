package com.example.cdr.eventsmanagementsystem.Keycloak;

import jakarta.annotation.PreDestroy;
import jakarta.ws.rs.core.Response;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.*;
import org.keycloak.representations.idm.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;

import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import com.example.cdr.eventsmanagementsystem.Config.WebClientConfig;
import reactor.core.publisher.Mono;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.PasswordResetResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.cdr.eventsmanagementsystem.Keycloak.KeycloakAdminProps;



@Slf4j
@RequiredArgsConstructor
@Service
public class KeycloakAdminService {

    private final KeycloakAdminProps props;
    private final Keycloak kc;
    private final RestTemplate restTemplate = new RestTemplate();
    private final WebClient webclient;

    private static final java.util.List<String> MANAGED =
        java.util.List.of("admin", "organizer", "attendee", "service_provider", "venue_provider");
    // If you want a display priority (optional):
    private static final java.util.List<String> ROLE_PRIORITY =
        java.util.List.of("admin", "organizer", "service_provider", "venue_provider", "attendee");
    // Single explicit constructor so Spring knows exactly what to use
    @Autowired
    public KeycloakAdminService(WebClient webclient,KeycloakAdminProps props) {
        this.webclient = webclient;
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


private String extractRole(UserRepresentation u) {
    // 1) Preferred: attribute userType: ["admin" | "organizer" | "attendee" | "service_provider" | "venue_provider"]
    if (u.getAttributes() != null) {
        List<String> vals = u.getAttributes().get("userType");
        if (vals != null && !vals.isEmpty() && vals.get(0) != null && !vals.get(0).isBlank()) {
            return vals.get(0).trim().toLowerCase();
        }
    }
    // 2) Fallback default — keeps your UI consistent
    return "attendee";
}

/** Count ALL realm users quickly. */
public long countUsers() {
    return realm().users().count();
}

/** Count users grouped by normalized role (from userType attribute). */
public Map<String, Long> countUsersByRole() {
    long total = countUsers();
    long admins = 0, organizers = 0, attendees = 0, serviceProviders = 0, venueProviders = 0;

    // page through users in batches
    final int pageSize = 100;
    for (int offset = 0; offset < total; offset += pageSize) {
        List<UserRepresentation> batch = realm()
                .users()
                .search("", offset, pageSize);

        for (UserRepresentation u : batch) {
            String role = extractRole(u);
            switch (role) {
                case "admin" -> admins++;
                case "organizer" -> organizers++;
                case "service_provider" -> serviceProviders++;
                case "venue_provider" -> venueProviders++;
                default -> attendees++; // treat any unknown/missing as attendee
            }
        }
    }

    Map<String, Long> map = new HashMap<>();
    map.put("total", total);
    map.put("admins", admins);
    map.put("organizers", organizers);
    map.put("attendees", attendees);
    map.put("service_providers", serviceProviders);
    map.put("venue_providers", venueProviders);
    return map;
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
public UserRepresentation updateUserRole(String userId, String targetRealmRole) {
    UserResource u = realm().users().get(userId);

    // Remove any managed roles, then add the target
    List<RoleRepresentation> current = u.roles().realmLevel().listAll();
    List<RoleRepresentation> managed = current.stream()
            .filter(rr -> isManagedRole(rr.getName()))
            .toList();
    if (!managed.isEmpty()) {
        u.roles().realmLevel().remove(managed);
    }
    if (targetRealmRole != null && !targetRealmRole.isBlank()) {
        RoleRepresentation rr = realm().roles().get(targetRealmRole).toRepresentation();
        u.roles().realmLevel().add(java.util.List.of(rr));
    }

    // Mirror into the userType attribute so your list shows the new role
    UserRepresentation rep = u.toRepresentation();
    java.util.Map<String, java.util.List<String>> attrs = rep.getAttributes();
    if (attrs == null) attrs = new java.util.HashMap<>();
    attrs.put("userType", java.util.List.of(targetRealmRole));
    rep.setAttributes(attrs);
    u.update(rep);

    return u.toRepresentation();
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


    /**
     * Public "Forgot password?" entry page (Auth endpoint) – for fallback/self-service.
     */
    public String buildForgotPasswordEntryUrl() {
        String publicBase = trimTrailingSlash(props.getPublicBaseUrl());
        String realm = props.getRealm();
        String clientId = props.getFrontendClientId();
        String redirect = props.getPostActionRedirectUri();

        // standard OIDC auth URL
        return String.format(
            "%s/realms/%s/protocol/openid-connect/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=openid",
            publicBase,
            urlEncode(realm),
            urlEncode(clientId),
            urlEncode(redirect)
        );
    }

    /**
     * Keycloak Account Console (optional link for users/admins).
     */
    public String buildAccountUrl() {
        String publicBase = trimTrailingSlash(props.getPublicBaseUrl());
        String realm = props.getRealm();
        return String.format("%s/realms/%s/account", publicBase, urlEncode(realm));
    }


    private String fetchAdminAccessToken() {
        String tokenUrl = props.getInternalBaseUrl()
            + "/realms/" + props.getRealm()
            + "/protocol/openid-connect/token";

        Map<String, Object> tokenResp = webclient.post()
            .uri(tokenUrl)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters
                .fromFormData("grant_type", "password")
                .with("client_id", props.getAdminClientId())
                .with("client_secret", props.getAdminClientSecret())
                .with("username", props.getAdminUsername())
                .with("password", props.getAdminPassword()))
            .retrieve()
            .bodyToMono(Map.class)
            .onErrorResume(e -> Mono.empty())
            .block();

        if (Objects.isNull(tokenResp)) return null;
        Object at = tokenResp.get("access_token");
        return at == null ? null : at.toString();
    }


    /**
     * Sends a time-limited action-token email for UPDATE_PASSWORD to the given userId.
     * Uses internal KC URL for admin REST, but public URL in redirect/links.
     */
   public boolean sendUpdatePasswordEmail(String userId) {
        String token = fetchAdminAccessToken();
        if (Objects.isNull(token)) return false;

        // Use PUBLIC base for execute-actions-email so email links use localhost
        String base = props.getPublicBaseUrl();
        String url = base + "/admin/realms/" + props.getRealm()
            + "/users/" + userId + "/execute-actions-email"
            + "?client_id=" + props.getFrontendClientId()
            + "&redirect_uri=" + props.getPostActionRedirectUri();

        try {
            webclient.put()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(token))
                .bodyValue(new String[] { "UPDATE_PASSWORD" })
                .retrieve()
                .toBodilessEntity()
                .block();
            return true;
        } catch (Exception ex) {
            return false;
        }
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

package com.example.cdr.eventsmanagementsystem.Controller.AdminController;

import com.example.cdr.eventsmanagementsystem.keycloak.KeycloakAdminService;
import lombok.RequiredArgsConstructor;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('admin')")
public class AdminUserController {

  private final KeycloakAdminService keycloakService;

  /** Request body for creating a user — includes username & password to match your UI */
  public record CreateUserRequest(
      String firstName,
      String lastName,
      String email,
      String role,
      String username,
      String password
  ) {}

  /** Create user */
  @PostMapping("/users")
  public ResponseEntity<?> create(@RequestBody CreateUserRequest req) {
    if (req.username() == null || req.username().isBlank()) {
      return ResponseEntity.badRequest().body("username is required");
    }
    if (req.password() == null || req.password().length() < 8) {
      return ResponseEntity.badRequest().body("password must be at least 8 chars");
    }
    if (req.email() == null || req.email().isBlank()) {
      return ResponseEntity.badRequest().body("email is required");
    }

    String id = keycloakService.createUser(
        req.username().trim(),
        req.email().trim(),
        req.firstName(),
        req.lastName(),
        req.password(),
        req.role() // e.g. admin | organizer | attendee | service_provider | venue_provider
    );

    Map<String, Object> body = new HashMap<>();
    body.put("id", id);
    return ResponseEntity.ok(body);
  }

  /** List users (make the shape `{ content: [...] }` to match your frontend’s `response.content || []`) */
  @GetMapping("/users")
  public ResponseEntity<Map<String, Object>> list(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "50") int size) {
    int first = Math.max(0, page) * Math.max(1, size);
    int max = Math.max(1, size);
    List<UserRepresentation> users = keycloakService.listUsers(first, max);
    Map<String, Object> body = new HashMap<>();
    body.put("content", users);
    body.put("page", page);
    body.put("size", size);
    return ResponseEntity.ok(body);
  }

  /** Update a user’s role (query param) */
  @PutMapping("/users/{id}/role")
  public ResponseEntity<Void> updateRole(@PathVariable String id, @RequestParam String role) {
    keycloakService.updateUserRole(id, role);
    return ResponseEntity.ok().build();
  }

  /** Deactivate / Activate */
  @PostMapping("/users/{id}/deactivate")
  public ResponseEntity<Void> deactivate(@PathVariable String id) {
    keycloakService.setEnabled(id, false);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/users/{id}/activate")
  public ResponseEntity<Void> activate(@PathVariable String id) {
    keycloakService.setEnabled(id, true);
    return ResponseEntity.ok().build();
  }

  /** Send reset password email */
  @PostMapping("/users/{id}/reset-password")
  public ResponseEntity<Void> reset(@PathVariable String id) {
    keycloakService.sendResetPasswordEmail(id);
    return ResponseEntity.ok().build();
  }

  /** Delete */
  @DeleteMapping("/users/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    keycloakService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }
}

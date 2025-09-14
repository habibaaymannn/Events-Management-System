package com.example.cdr.eventsmanagementsystem.Controller.AdminController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.AdminControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.Keycloak.KeycloakAdminService;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.PasswordResetResponse;
import com.example.cdr.eventsmanagementsystem.Email.TerminationEmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(AdminControllerConstants.ADMIN_BASE_URL)
@RequiredArgsConstructor
@PreAuthorize("hasRole('" + RoleConstants.ADMIN_ROLE + "')")
@Tag(name = "Admin - Users", description = "Admin user management APIs")
public class AdminUserController {

  private final KeycloakAdminService keycloakService;
  private final TerminationEmailService terminationEmailService;

  /** Request body for creating a user — includes username & password to match your UI */
  public record CreateUserRequest(
      String firstName, String lastName, String email, String role, String username, String password
  ) {}

  @Operation(summary = "Create user", description = "Creates a Keycloak user with the given role")
  @PostMapping(AdminControllerConstants.ADMIN_USERS_URL)
  public ResponseEntity<?> create(@RequestBody CreateUserRequest req) {
    if (req.username() == null || req.username().isBlank()) return ResponseEntity.badRequest().body("username is required");
    if (req.password() == null || req.password().length() < 8) return ResponseEntity.badRequest().body("password must be at least 8 chars");
    if (req.email() == null || req.email().isBlank()) return ResponseEntity.badRequest().body("email is required");

    String id = keycloakService.createUser(
        req.username().trim(), req.email().trim(), req.firstName(), req.lastName(), req.password(), req.role()
    );
    return ResponseEntity.ok(Map.of("id", id));
  }

  @Operation(summary = "List users", description = "Lists Keycloak users (paged as first/max)")
  @GetMapping(AdminControllerConstants.ADMIN_USERS_URL)
  public ResponseEntity<Map<String, Object>> list(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "50") int size) {
    int first = Math.max(0, page) * Math.max(1, size);
    int max = Math.max(1, size);
    List<UserRepresentation> users = keycloakService.listUsers(first, max);
    return ResponseEntity.ok(new HashMap<>() {{
      put("content", users); put("page", page); put("size", size);
    }});
  }

  @Operation(summary = "Update user role", description = "Updates a user's role in Keycloak")
  @PutMapping(AdminControllerConstants.ADMIN_UPDATE_USER_ROLE_URL)
  public ResponseEntity<Map<String, String>> updateRole(@PathVariable("userId") String id,
                                                        @RequestParam String role) {
    keycloakService.updateUserRole(id, role);
    return ResponseEntity.ok(Map.of("role", role));
  }

  @Operation(summary = "Deactivate user", description = "Disables a user account in Keycloak")
  @PostMapping(AdminControllerConstants.ADMIN_USER_DEACTIVATE_URL)
  public ResponseEntity<Void> deactivate(@PathVariable("userId") String id) {
    keycloakService.setEnabled(id, false);
    return ResponseEntity.ok().build();
  }

  @Operation(summary = "Activate user", description = "Enables a previously disabled user account")
  @PostMapping(AdminControllerConstants.USER_ACTIVATE)
  public ResponseEntity<Void> activate(@PathVariable("userId") String id) {
    keycloakService.setEnabled(id, true);
    return ResponseEntity.ok().build();
  }

  @Operation(summary = "Send reset password email", description = "Sends a password reset email via Keycloak")
  @PostMapping(AdminControllerConstants.USER_RESET_PASSWORD)
  public ResponseEntity<PasswordResetResponse> reset(@PathVariable("userId") String id) {
    PasswordResetResponse res = keycloakService.sendResetPasswordAndOptions(id);
    return ResponseEntity.ok(res);
  }

  @Operation(summary = "Delete user", description = "Deletes a user from Keycloak, optionally notifying them by email")
  @DeleteMapping(AdminControllerConstants.ADMIN_USERS_URL + AdminControllerConstants.USER_ID)
  public ResponseEntity<Map<String, Object>> delete(@PathVariable("userId") String id,
                                                    @RequestParam(defaultValue = "false") boolean notify,
                                                    @RequestParam(required = false) String reason) {
    var userOpt = keycloakService.findById(id);
    boolean notified = false;
    if (notify && userOpt.isPresent()) {
      var u = userOpt.get();
      String email = u.getEmail();
      String username = (u.getUsername() != null && !u.getUsername().isBlank()) ? u.getUsername()
                      : (u.getEmail() != null ? u.getEmail() : "user");
      if (email != null && !email.isBlank()) {
        terminationEmailService.sendAccountTerminationEmail(email, username, reason);
        notified = true;
      }
    }
    keycloakService.deleteUser(id);
    return ResponseEntity.ok(Map.of("deleted", true, "notified", notified));
  }
}

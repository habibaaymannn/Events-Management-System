package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import jakarta.ws.rs.core.Response;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.stereotype.Service;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import java.util.List;


@Service
public class KeycloakService {
    private final Keycloak keycloak;
    private final String realm;

    public KeycloakService() {
        this.realm = "EMS-realm";
        this.keycloak = KeycloakBuilder.builder()
                .serverUrl("http://localhost:8180")
                .realm("master")
                .username("admin")
                .password("admin")
                .clientId("admin-cli")
                .grantType(OAuth2Constants.PASSWORD)
                .build();
    }
    public String createUser(String email, String firstName, String lastName, String password) {
        UsersResource usersResource = keycloak.realm(realm).users();

        UserRepresentation user = new UserRepresentation();
        user.setUsername(email);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(true);


        Response response = usersResource.create(user);

        if (response.getStatus() != 201) {
            throw new RuntimeException("Failed to create user: " + response.getStatusInfo());
        }

        String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false);

        usersResource.get(userId).resetPassword(credential);

        return userId;
    }
    public void assignRoleToUser(String userId, String roleName) {
        var realmResource = keycloak.realm(realm);
        var role = realmResource.roles().get(roleName).toRepresentation();

        realmResource.users().get(userId).roles()
                .realmLevel()
                .add(List.of(role));
    }
}

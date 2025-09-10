package com.example.cdr.eventsmanagementsystem.keycloak;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component @Getter
public class KeycloakAdminProps {
  @Value("${keycloak.base-url}") private String baseUrl;
  @Value("${keycloak.realm}") private String realm;
  @Value("${keycloak.admin.client-id}") private String adminClientId;
  @Value("${keycloak.admin.client-secret}") private String adminClientSecret;

  
  // NEW: let backend use a realm admin user if provided
  @Value("${keycloak.admin.username:}") private String adminUsername; // optional
  @Value("${keycloak.admin.password:}") private String adminPassword; //

     @Value("${keycloak.create.email-verified:false}")
    private boolean markEmailVerifiedOnCreate;

    @Value("${keycloak.create.password-temporary:false}")
    private boolean temporaryPasswordOnCreate;
}

package com.example.cdr.eventsmanagementsystem.Keycloak;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component @Getter
public class KeycloakAdminProps {
  @Value("${keycloak.base-url}")
  private String baseUrl;

  @Value("${keycloak.realm}")
  private String realm;

  @Value("${keycloak.admin.client-id}")
  private String adminClientId;

  @Value("${keycloak.admin.client-secret}")
  private String adminClientSecret;

  @Value("${keycloak.internalBaseUrl}")
  private String internalBaseUrl;

  @Value("${keycloak.publicBaseUrl}")
  private String publicBaseUrl;

  @Value("${keycloak.frontendClientId}")
  private String frontendClientId;

  @Value("${keycloak.postActionRedirectUri}")
  private String postActionRedirectUri;
  // NEW: let backend use a realm admin user if provided
  @Value("${keycloak.admin.username:}") private String adminUsername; // optional
  @Value("${keycloak.admin.password:}") private String adminPassword; //

  @Value("${keycloak.create.email-verified:false}")
  private boolean markEmailVerifiedOnCreate;

  @Value("${keycloak.create.password-temporary:false}")
  private boolean temporaryPasswordOnCreate;
}

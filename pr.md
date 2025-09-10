## Summary
Admin functionalities across backend and frontend to manage users via Keycloak.

## What changed
- **Keycloak admin auth**: Switched from client_credentials (which caused
  `invalid_client` / “Public client not allowed to retrieve service account”) to
  **password grant** using the realm user `admin1`. This avoids service account
  restrictions and fixes HTTP 401 from the admin client.
- **KeycloakAdminProps**: Added config props:
  - `keycloak.base-url`, `keycloak.realm`
  - `keycloak.admin.client-id`, `keycloak.admin.client-secret`
  - `keycloak.admin.username`, `keycloak.admin.password`
  - flags for email verified / temporary password on create
- **KeycloakAdminService**:
  - Build a Keycloak instance with PASSWORD grant.
  - Implement CRUD endpoints for users: create, list, enable/disable,
    update role, delete; close client on shutdown.
  - Replace old admin-cli flow.
- **SecurityConfig**:
  - Resource server JWT with JWK/JWT converter that maps `realm_access.roles`
    ? `ROLE_*` authorities.
  - CORS for http://localhost:3000 and Swagger endpoints allowed.
- **Env / compose wiring**:
  - Introduced `KEYCLOAK_BASE_URL=http://keycloak:8080` (Docker),
    `KEYCLOAK_REALM=EMS-realm`,
    `KEYCLOAK_ADMIN_CLIENT_ID=spring-boot-app`,
    `KEYCLOAK_ADMIN_CLIENT_SECRET=…`,
    `KEYCLOAK_ADMIN_USERNAME=admin1`, `KEYCLOAK_ADMIN_PASSWORD=adminpass`,
    `ISSUER_URI=http://keycloak:8080/realms/EMS-realm`.
- **Realm configuration**:
  - Roles (`admin`, `organizer`, `attendee`, `service_provider`,
    `venue_provider`), client `spring-boot-app` as confidential, SPA client,
    mappers for roles; SMTP setup.
- **Controllers / endpoints**:
  - Admin user endpoints (list/create/update role/toggle enabled/delete).
- **Frontend**:
  - `adminApi.js` + `UserManagement.js` to hit the admin endpoints with SPA
    token.
- **Fixes**:
  - Resolved 401s from Keycloak admin client.
  - Fixed Bean creation by using explicit constructor / injection pattern.
  - Added logging and better error propagation.

## How to test
1. Import `realm.json` into Keycloak.
2. Start stack (Keycloak, backend, frontend).
3. Log in as `admin1` in the SPA; go to Admin ? Users.
4. Create/list/disable users and update roles; verify in Keycloak Admin Console.

## Notes
- Using PASSWORD grant is deliberate for admin flows under a real realm user.
- `spring-boot-app` remains confidential; tokens validated via resource server.

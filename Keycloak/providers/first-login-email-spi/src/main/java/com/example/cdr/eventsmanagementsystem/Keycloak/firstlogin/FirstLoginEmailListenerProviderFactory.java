package com.example.cdr.eventsmanagementsystem.Keycloak.firstlogin;

import org.keycloak.Config;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventListenerProviderFactory;
import org.keycloak.models.KeycloakSession;

public class FirstLoginEmailListenerProviderFactory implements EventListenerProviderFactory {

    public static final String ID = "first-login-email";

    @Override
    public EventListenerProvider create(KeycloakSession session) {
        return new FirstLoginEmailListenerProvider(session);
    }

    @Override
    public void init(Config.Scope config) {
        // no-op
    }

    @Override
    public void postInit(org.keycloak.models.KeycloakSessionFactory factory) {
        // no-op
    }

    @Override
    public void close() {
        // no-op
    }

    @Override
    public String getId() {
        return ID;
    }
}

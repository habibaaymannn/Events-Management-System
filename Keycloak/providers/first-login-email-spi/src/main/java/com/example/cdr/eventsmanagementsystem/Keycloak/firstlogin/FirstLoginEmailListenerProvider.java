package com.example.cdr.eventsmanagementsystem.Keycloak.firstlogin;

import org.keycloak.email.EmailTemplateProvider;
import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventType;
import org.keycloak.http.HttpRequest;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.theme.Theme;

import jakarta.ws.rs.core.HttpHeaders;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class FirstLoginEmailListenerProvider implements EventListenerProvider {

  private final KeycloakSession session;

  public FirstLoginEmailListenerProvider(KeycloakSession session) {
    this.session = session;
  }

  @Override
  public void onEvent(Event event) {
    if (event.getType() != EventType.LOGIN) return;

    RealmModel realm = session.getContext().getRealm();
    UserModel user = session.users().getUserById(realm, event.getUserId());
    if (user == null) return;

    // send only once per user
    if ("true".equals(user.getFirstAttribute("firstLoginEmailSent"))) return;

    try {
      // --- device fingerprint (best-effort) ---
      HttpRequest req = session.getContext().getHttpRequest();
      String userAgent = null;
      if (req != null) {
        HttpHeaders hh = req.getHttpHeaders();
        if (hh != null) userAgent = hh.getHeaderString("User-Agent");
      }
      if (userAgent == null) userAgent = "Unknown device";

      String ip = event.getIpAddress() != null ? event.getIpAddress() : "Unknown IP";

      // optional geo (left null unless you wire GeoIP)
      String city = null, country = null;

      Map<String, Object> attrs = new HashMap<>();
      attrs.put("username", user.getUsername());
      attrs.put("realmName", realm.getDisplayName() != null ? realm.getDisplayName() : realm.getName());
      attrs.put("ip", ip);
      attrs.put("userAgent", userAgent);
      attrs.put("city", city);
      attrs.put("country", country);

      // resolve subject from theme messages and pass as LITERAL
      Theme emailTheme = session.theme().getTheme(realm.getEmailTheme(), Theme.Type.EMAIL);
      Locale locale = session.getContext().resolveLocale(user);
      String subject =
          emailTheme.getMessages(locale).getProperty("emailSubjectFirstLogin", "First Login into EMS");

      EmailTemplateProvider etp = session.getProvider(EmailTemplateProvider.class)
          .setRealm(realm)
          .setUser(user);

      // send with literal subject + your FTL
      etp.send(subject, "first-login.ftl", attrs);

      user.setSingleAttribute("firstLoginEmailSent", "true");
    } catch (Exception ignore) {
      // swallow — don’t break login
    }
  }

  @Override
  public void onEvent(org.keycloak.events.admin.AdminEvent event, boolean includeRepresentation) { }

  @Override
  public void close() { }
}

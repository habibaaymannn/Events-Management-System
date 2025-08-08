package com.example.cdr.eventsmanagementsystem.Filters;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Service.Authentication.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Component
public class UserFilter extends OncePerRequestFilter {
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();

            String keycloakId = jwt.getSubject();
            String email = jwt.getClaimAsString("email");
            String firstName = jwt.getClaimAsString("given_name");
            String lastName = jwt.getClaimAsString("family_name");

            List<String> roles = (List<String>) ((Map<String, Object>) jwt.getClaims().get("realm_access")).get("roles");

            String userType = null;
            if(roles != null){
                if (roles.contains("venue_provider")) {
                    userType = "venue_provider";
                }
                else if (roles.contains("service_provider")) {
                    userType = "service_provider";
                }
                else if (roles.contains("event_organizer")) {
                    userType = "event_organizer";
                }
                else if (roles.contains("event_attendee")) {
                    userType = "event_attendee";
                }
                else{
                    userType = "admin";
                }
            }
            if (keycloakId != null && email != null && firstName != null && lastName != null) {
                UserDTO userDTO = new UserDTO();
                userDTO.setKeycloakId(keycloakId);
                userDTO.setEmail(email);
                userDTO.setFirstName(firstName);
                userDTO.setLastName(lastName);
                userDTO.setUserType(userType);

                userService.saveUserData(userDTO);
            }
        }
        filterChain.doFilter(request,response);
    }
}

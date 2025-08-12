package com.example.cdr.eventsmanagementsystem.Service.Auth;

import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.VenueProviderRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.cdr.eventsmanagementsystem.Model.User.Admin;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.AttendeeRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.OrganizerRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.ServiceProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserSyncService {
    
    private final AttendeeRepository attendeeRepository;
    private final OrganizerRepository organizerRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final VenueProviderRepository venueProviderRepository;

    @Transactional
    public BaseRoleEntity ensureUserExists() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            
            String userId = jwt.getClaimAsString("sub");
            String email = jwt.getClaimAsString("email");
            String firstName = jwt.getClaimAsString("given_name");
            String lastName = jwt.getClaimAsString("family_name");
            
            String userRole = getCurrentUserRole(authentication);
            log.info("Processing user sync for userId: {} with role: {}", userId, userRole);
            
            BaseRoleEntity existingUser = findExistingUser(userId, userRole);
            
            if (existingUser != null) {
                log.debug("Found existing user: {} with role: {}", userId, userRole);
                return existingUser;
            }
            
            return createNewUser(userId, email, firstName, lastName, userRole);
        }
        
        throw new RuntimeException("No authenticated user found");
    }

    @Transactional
    public Attendee ensureAttendeeExists() {
        BaseRoleEntity user = ensureUserExists();
        if (user instanceof Attendee) {
            return (Attendee) user;
        }
        throw new RuntimeException("Current user is not an attendee");
    }

    @Transactional
    public Organizer ensureOrganizerExists() {
        BaseRoleEntity user = ensureUserExists();
        if (user instanceof Organizer) {
            return (Organizer) user;
        }
        throw new RuntimeException("Current user is not an organizer");
    }

    @Transactional
    public ServiceProvider ensureServiceProviderExists() {
        BaseRoleEntity user = ensureUserExists();
        if (user instanceof ServiceProvider) {
            return (ServiceProvider) user;
        }
        throw new RuntimeException("Current user is not a service provider");
    }

    @Transactional
    public VenueProvider ensureVenueProviderExists() {
        BaseRoleEntity user = ensureUserExists();
        if (user instanceof VenueProvider) {
            return (VenueProvider) user;
        }
        throw new RuntimeException("Current user is not a venue provider");
    }

    @Transactional
    public Admin ensureAdminExists() {
        BaseRoleEntity user = ensureUserExists();
        if (user instanceof Admin) {
            return (Admin) user;
        }
        throw new RuntimeException("Current user is not an admin");
    }


    private String getCurrentUserRole(Authentication authentication) {
        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_admin"))) {
            return "admin";
        }
        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_organizer"))) {
            return "organizer";
        }
        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_venue provider"))) {
            return "venue provider";
        }
        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_service provider"))) {
            return "service provider";
        }
        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_attendee"))) {
            return "attendee";
        }
        
        return null;
    }

    public BaseRoleEntity findExistingUser(String userId, String role) {
        switch (role.toLowerCase()) {
            case "attendee":
                return attendeeRepository.findById(userId).orElse(null);
            case "organizer":
                return organizerRepository.findById(userId).orElse(null);
            case "service provider":
                return serviceProviderRepository.findById(userId).orElse(null);
            case "venue provider":
                return venueProviderRepository.findById(userId).orElse(null);
            default:
                return attendeeRepository.findById(userId).orElse(null);
        }
    }

    private BaseRoleEntity createNewUser(String userId, String email, String firstName, String lastName, String role) {
        log.info("Creating new {} from Keycloak JWT: {}", role, userId);
        
        BaseRoleEntity newUser = createUserByRole(role);
        
        newUser.setId(userId);
        newUser.setEmail(email);
        newUser.setFirstName(firstName != null ? firstName : "Unknown");
        newUser.setLastName(lastName != null ? lastName : "User");
        
        BaseRoleEntity savedUser = saveUserByRole(newUser, role);
        
        log.info("Successfully created {} user: {} with email: {}", role, userId, email);
        return savedUser;
    }

    private BaseRoleEntity createUserByRole(String role) {
        switch (role.toLowerCase()) {
            case "attendee":
                return new Attendee();
            case "organizer":
                return new Organizer();
            case "service provider":
                return new ServiceProvider();
            case "venue provider":
                return new VenueProvider();
            case "admin":
                return new Admin();
            default:
                return new Attendee();
        }
    }

    private BaseRoleEntity saveUserByRole(BaseRoleEntity user, String role) {
        switch (role.toLowerCase()) {
            case "attendee":
                return attendeeRepository.save((Attendee) user);
            case "organizer":
                return organizerRepository.save((Organizer) user);
            case "service provider":
                return serviceProviderRepository.save((ServiceProvider) user);
            case "venue provider":
                    return venueProviderRepository.save((VenueProvider) user);
            default:
                return attendeeRepository.save((Attendee) user);
        }
    }

    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("sub");
        }
        
        throw new RuntimeException("No authenticated user found");
    }

    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("email");
        }
        
        return null;
    }
    public String getCurrentUserFirstName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("given_name");
        }
        return null;
    }
    public String getCurrentUserLastName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("family_name");
        }
        return null;
    }
}
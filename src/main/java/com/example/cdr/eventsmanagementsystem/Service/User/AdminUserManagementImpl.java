package com.example.cdr.eventsmanagementsystem.Service.User;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserCreateDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserDetailsDto;
import com.example.cdr.eventsmanagementsystem.Mapper.AdminMapper;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.*;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserRoleHandler;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
/// this class will be removed
@Service
@RequiredArgsConstructor
public class AdminUserManagementImpl implements AdminUserManagement {
    private final AdminRepository adminRepository;
    private final OrganizerRepository organizerRepository;
    private final AttendeeRepository attendeeRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final VenueProviderRepository venueProviderRepository;
    private final AdminMapper adminMapper;
    private final UserSyncService userSyncService;

    @Override
    public Page<UserDetailsDto> getAllUsers(Pageable pageable) {
        List<UserDetailsDto> items =
                adminRepository.findAll().stream().map(adminMapper::toUserDetails)
                        .collect(Collectors.toList());
        items.addAll(organizerRepository.findAll().stream().map(adminMapper::toUserDetails).toList());
        items.addAll(attendeeRepository.findAll().stream().map(adminMapper::toUserDetails).toList());
        items.addAll(serviceProviderRepository.findAll().stream().map(adminMapper::toUserDetails).toList());
        items.addAll(venueProviderRepository.findAll().stream().map(adminMapper::toUserDetails).toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), items.size());
        List<UserDetailsDto> content = start > end ? List.of() : items.subList(start, end);
        return new PageImpl<>(content, pageable, items.size());
    }

    @Override
    public UserDetailsDto createUser(UserCreateDto userCreateDto) {

        String role = userCreateDto.getRole().toLowerCase();
        UserRoleHandler<?> handler = userSyncService.getHandlerForRole(role);
        BaseRoleEntity entity = handler.createNewUser(
                UUID.randomUUID().toString(),
                userCreateDto.getEmail(),
                userCreateDto.getFirstName(),
                userCreateDto.getLastName()        );
        return adminMapper.toUserDetails(entity);
    }
    //update keycloak role
    @Override
    public UserDetailsDto updateUserRole(String userId, String role) {
        BaseRoleEntity existing = userSyncService.findUserById(userId);
        if (Objects.isNull(existing)) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        UserRoleHandler<? extends BaseRoleEntity> targetHandler = userSyncService.getHandlerForRole(role);

        if (existing.getClass().equals(targetHandler.getRoleClass())) {
            return adminMapper.toUserDetails(existing);
        }

        BaseRoleEntity target = targetHandler.createNewUser(
                existing.getId(),
                existing.getEmail(),
                existing.getFirstName(),
                existing.getLastName()
        );

        target.setActive(existing.isActive());
        UserRoleHandler oldHandler = userSyncService.getHandlerForRole(existing.getClass().getSimpleName().toLowerCase());
        oldHandler.deleteUser(existing.getId());
        targetHandler.saveUser(target);
        return adminMapper.toUserDetails(target);
    }

    @Override
    public void deactivateUser(String userId) {
        BaseRoleEntity user = userSyncService.findUserById(userId);
        if (Objects.isNull(user)) {
            throw new IllegalArgumentException("User not found: " + userId);
        }
        user.setActive(false);
        UserRoleHandler handler = userSyncService.getHandlers().stream()
                .filter(h -> h.getRoleClass().isInstance(user))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No handler for user type"));
        handler.saveUser(user);
    }

    @Override
    public void resetPassword(String userId) {
        // TODO: Implement password reset
        throw new UnsupportedOperationException("Not implemented");
    }
}

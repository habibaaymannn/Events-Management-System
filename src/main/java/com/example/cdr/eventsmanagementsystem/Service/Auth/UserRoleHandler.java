package com.example.cdr.eventsmanagementsystem.Service.Auth;

import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;

/**
 * Generic interface for handling operations on users with a specific role.
 * @param <T> the type of user entity that extends BaseRoleEntity
 */

public interface UserRoleHandler<T extends BaseRoleEntity> {
    boolean supports(String role);
    T findUserById(String userId);
    T createNewUser(String userId, String email, String firstName, String lastName);
    BaseRoleEntity saveUser(BaseRoleEntity user);
}

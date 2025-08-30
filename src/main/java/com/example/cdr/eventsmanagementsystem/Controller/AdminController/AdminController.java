package com.example.cdr.eventsmanagementsystem.Controller.AdminController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.AdminControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Base abstract controller for all admin-related endpoints.
 * Applies the base URL mapping and restricts access to users with the ADMIN role.
 */
@RequestMapping(AdminControllerConstants.ADMIN_BASE_URL)
@PreAuthorize("hasRole('" + RoleConstants.ADMIN_ROLE + "')")
public abstract class AdminController {
}



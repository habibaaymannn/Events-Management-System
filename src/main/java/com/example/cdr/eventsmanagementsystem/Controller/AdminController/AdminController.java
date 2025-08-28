package com.example.cdr.eventsmanagementsystem.Controller.AdminController;

import com.example.cdr.eventsmanagementsystem.Constants.AdminControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.RoleConstants;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping(AdminControllerConstants.ADMIN_BASE_URL)
@PreAuthorize("hasRole('" + RoleConstants.ADMIN_ROLE + "')")
public class AdminController {
}



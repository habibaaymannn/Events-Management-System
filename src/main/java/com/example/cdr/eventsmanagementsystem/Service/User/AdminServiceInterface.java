package com.example.cdr.eventsmanagementsystem.Service.User;

/**
 * Composite interface for admin operations.
 * Combines user management, event management, and statistical reporting
 * functionalities for admin purposes.
 */

public interface AdminServiceInterface extends
        AdminUserManagement,
        AdminEventsManagement,
        StatisticsManagement
{}
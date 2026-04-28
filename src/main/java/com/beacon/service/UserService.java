package com.beacon.service;

import com.beacon.model.User;
import com.beacon.dao.UserDAO;

/**
 * UserService handles user authentication and retrieval logic.
 */
public class UserService {

    private final UserDAO userDAO = new UserDAO();

    /**
     * Authenticate a user with username and password.
     *
     * @param username The username
     * @param password The password
     * @return User object if authentication succeeds, null otherwise
     */
    public User authenticate(String username, String password) {
        if (username == null || username.trim().isEmpty() || password == null) {
            return null;
        }
        return userDAO.authenticate(username, password);
    }

    /**
     * Get user by ID.
     *
     * @param userId The user ID
     * @return User object if found, null otherwise
     */
    public User getUserById(int userId) {
        return userDAO.getUserById(userId);
    }

    /**
     * Get user by username.
     *
     * @param username The username
     * @return User object if found, null otherwise
     */
    public User getUserByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return null;
        }
        return userDAO.getUserByUsername(username);
    }

    /**
     * Create a new user account (signup).
     *
     * @param username The username
     * @param password The password
     * @param fullName The full name
     * @param email    The email address
     * @param role     The user role (DONOR or VOLUNTEER)
     * @return Created User object if successful, null otherwise
     */
    public User createUser(String username, String password, String fullName, String email, String role) {
        // Validate inputs
        if (username == null || username.trim().isEmpty() || username.length() < 3) {
            System.err.println("[SERVICE] Username must be at least 3 characters");
            return null;
        }

        // Validate password requirements
        if (password == null || password.length() < 6) {
            System.err.println("[SERVICE] Password must be at least 6 characters");
            return null;
        }
        if (!password.matches(".*[A-Z].*")) {
            System.err.println("[SERVICE] Password must contain at least one uppercase letter");
            return null;
        }
        if (!password.matches(".*[0-9].*")) {
            System.err.println("[SERVICE] Password must contain at least one number");
            return null;
        }

        if (fullName == null || fullName.trim().isEmpty()) {
            System.err.println("[SERVICE] Full name is required");
            return null;
        }
        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            System.err.println("[SERVICE] Valid email is required");
            return null;
        }
        // Only allow DONOR and VOLUNTEER roles for signup
        if (role == null || (!role.equals("DONOR") && !role.equals("VOLUNTEER"))) {
            System.err.println("[SERVICE] Invalid role: " + role);
            return null;
        }

        User newUser = new User(username.trim(), password, fullName.trim(), email.trim(), role);
        return userDAO.createUser(newUser);
    }
}
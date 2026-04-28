package com.beacon.dao;

import com.beacon.model.User;
import com.beacon.util.DatabaseConnection;

import java.sql.*;

/**
 * UserDAO provides database operations for User entities.
 * Handles authentication and user retrieval.
 */
public class UserDAO {

    /**
     * Authenticate a user by username and password.
     *
     * @param username The username to authenticate
     * @param password The password to check
     * @return User object if authentication succeeds, null otherwise
     */
    public User authenticate(String username, String password) {
        String query = "SELECT user_id, username, full_name, email, role, created_at FROM users WHERE username = ? AND password = ?";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, username);
            stmt.setString(2, password);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    user.setUsername(rs.getString("username"));
                    user.setFullName(rs.getString("full_name"));
                    user.setEmail(rs.getString("email"));
                    user.setRole(rs.getString("role"));
                    user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    return user;
                }
            }
        } catch (SQLException e) {
            System.err.println("[DB] Authentication error: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Get a user by ID.
     *
     * @param userId The user ID
     * @return User object if found, null otherwise
     */
    public User getUserById(int userId) {
        String query = "SELECT user_id, username, full_name, email, role, created_at FROM users WHERE user_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    user.setUsername(rs.getString("username"));
                    user.setFullName(rs.getString("full_name"));
                    user.setEmail(rs.getString("email"));
                    user.setRole(rs.getString("role"));
                    user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    return user;
                }
            }
        } catch (SQLException e) {
            System.err.println("[DB] Error fetching user: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Get a user by username.
     *
     * @param username The username
     * @return User object if found, null otherwise
     */
    public User getUserByUsername(String username) {
        String query = "SELECT user_id, username, full_name, email, role, created_at FROM users WHERE username = ?";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, username);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    user.setUsername(rs.getString("username"));
                    user.setFullName(rs.getString("full_name"));
                    user.setEmail(rs.getString("email"));
                    user.setRole(rs.getString("role"));
                    user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    return user;
                }
            }
        } catch (SQLException e) {
            System.err.println("[DB] Error fetching user: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Create a new user in the database.
     *
     * @param user The user object to create
     * @return The created user with userId set, or null if creation fails
     */
    public User createUser(User user) {
        if (user == null || user.getUsername() == null || user.getPassword() == null) {
            return null;
        }

        // Check if username already exists
        if (getUserByUsername(user.getUsername()) != null) {
            System.err.println("[DB] Username already exists: " + user.getUsername());
            return null;
        }

        String query = "INSERT INTO users (username, password, full_name, email, role, created_at) VALUES (?, ?, ?, ?, ?, GETDATE())";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getPassword());
            stmt.setString(3, user.getFullName() != null ? user.getFullName() : "");
            stmt.setString(4, user.getEmail() != null ? user.getEmail() : "");
            stmt.setString(5, user.getRole() != null ? user.getRole() : "VOLUNTEER");

            int affectedRows = stmt.executeUpdate();

            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        user.setUserId(generatedKeys.getInt(1));
                        user.setCreatedAt(java.time.LocalDateTime.now());
                        System.out.println("[DB] User created successfully: " + user.getUsername() + " (ID: "
                                + user.getUserId() + ")");
                        return user;
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("[DB] Error creating user: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }
}

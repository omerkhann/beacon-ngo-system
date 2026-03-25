package com.beacon.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Database connection utility class.
 * Provides a centralized JDBC connection to the SQL Server database.
 */
public class DatabaseConnection {

    private static final String URL = System.getenv().getOrDefault(
            "BEACON_DB_URL",
            "jdbc:sqlserver://localhost:1433;databaseName=beacon_db;encrypt=true;trustServerCertificate=true");
    private static final String USER = System.getenv().getOrDefault("BEACON_DB_USER", "sa");
    private static final String PASSWORD = System.getenv().getOrDefault("BEACON_DB_PASSWORD", "password");

    /**
     * Returns a new database connection for each call.
     */
    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");

            String normalizedUrl = URL.toLowerCase();
            boolean integratedAuth = normalizedUrl.contains("integratedsecurity=true")
                    || normalizedUrl.contains("authentication=activedirectoryintegrated");

            if (integratedAuth) {
                return DriverManager.getConnection(URL);
            }

            return DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (ClassNotFoundException e) {
            System.err.println("SQL Server JDBC Driver not found.");
            e.printStackTrace();
            throw new SQLException("Driver not found", e);
        }
    }

    /**
     * Deprecated no-op. Connections are managed via try-with-resources.
     */
    public static void closeConnection() {
        // Intentionally empty.
    }
}

package com.beacon.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Database connection utility class.
 * Provides a centralized JDBC connection to the SQL Server database.
 */
public class DatabaseConnection {

    private static final String URL = getDbUrl();
    private static final String USER = System.getenv().getOrDefault("BEACON_DB_USER", "sa");
    private static final String PASSWORD = System.getenv().getOrDefault("BEACON_DB_PASSWORD", "password");

    private static String getDbUrl() {
        // First check Java system properties (set via -D flags)
        String url = System.getProperty("BEACON_DB_URL");
        if (url != null && !url.isEmpty()) {
            System.out.println("[DB] Using BEACON_DB_URL from Java properties");
            return url;
        }

        // Then check environment variables
        url = System.getenv("BEACON_DB_URL");
        if (url != null && !url.isEmpty()) {
            System.out.println("[DB] Using BEACON_DB_URL from environment");
            return url;
        }

        // Default fallback
        System.out.println("[DB] Using default SQL Server connection URL");
        return "jdbc:sqlserver://localhost:1433;databaseName=beacon_db;encrypt=true;trustServerCertificate=true";
    }

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

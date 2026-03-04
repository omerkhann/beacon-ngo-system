package com.beacon.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Database connection utility class.
 * Provides a centralized JDBC connection to the MySQL database.
 */
public class DatabaseConnection {

    private static final String URL = "jdbc:mysql://localhost:3306/beacon_db";
    private static final String USER = "root";
    private static final String PASSWORD = "password"; // Update with your MySQL password

    private static Connection connection = null;

    /**
     * Returns a singleton database connection.
     */
    public static Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                connection = DriverManager.getConnection(URL, USER, PASSWORD);
                System.out.println("Database connected successfully.");
            } catch (ClassNotFoundException e) {
                System.err.println("MySQL JDBC Driver not found.");
                e.printStackTrace();
                throw new SQLException("Driver not found", e);
            }
        }
        return connection;
    }

    /**
     * Closes the database connection.
     */
    public static void closeConnection() {
        if (connection != null) {
            try {
                connection.close();
                System.out.println("Database connection closed.");
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}

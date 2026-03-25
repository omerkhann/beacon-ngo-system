package com.beacon.dao;

import com.beacon.model.Expense;
import com.beacon.util.DatabaseConnection;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for expense operations.
 * Ref: US5 (Admin Expense Log)
 */
public class ExpenseDAO {

    public boolean createExpense(Expense expense) {
        String sql = "INSERT INTO expenses (campaign_id, created_by, category, description, amount) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, expense.getCampaignId());
            stmt.setInt(2, expense.getCreatedBy());
            stmt.setString(3, expense.getCategory());
            stmt.setString(4, expense.getDescription());
            stmt.setBigDecimal(5, expense.getAmount());

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet keys = stmt.getGeneratedKeys()) {
                    if (keys.next()) {
                        expense.setExpenseId(keys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating expense: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    public BigDecimal getTotalExpensesByCampaign(int campaignId) {
        String sql = "SELECT ISNULL(SUM(amount), 0) AS total_expenses FROM expenses WHERE campaign_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, campaignId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getBigDecimal("total_expenses");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching total expenses: " + e.getMessage());
            e.printStackTrace();
        }
        return BigDecimal.ZERO;
    }

    public List<Expense> getExpensesByCampaign(int campaignId) {
        List<Expense> expenses = new ArrayList<>();
        String sql = "SELECT * FROM expenses WHERE campaign_id = ? ORDER BY expense_date DESC";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, campaignId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    expenses.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching expenses: " + e.getMessage());
            e.printStackTrace();
        }
        return expenses;
    }

    private Expense mapRow(ResultSet rs) throws SQLException {
        Expense expense = new Expense();
        expense.setExpenseId(rs.getInt("expense_id"));
        expense.setCampaignId(rs.getInt("campaign_id"));
        expense.setCreatedBy(rs.getInt("created_by"));
        expense.setCategory(rs.getString("category"));
        expense.setDescription(rs.getString("description"));
        expense.setAmount(rs.getBigDecimal("amount"));
        expense.setExpenseDate(rs.getTimestamp("expense_date").toLocalDateTime());
        return expense;
    }
}

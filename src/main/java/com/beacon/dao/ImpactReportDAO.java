package com.beacon.dao;

import com.beacon.model.ImpactReportRow;
import com.beacon.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for impact report aggregation.
 * Ref: US8 (Impact Report)
 */
public class ImpactReportDAO {

    public List<ImpactReportRow> getImpactReportRows() {
        List<ImpactReportRow> rows = new ArrayList<>();
        String sql = "SELECT c.campaign_id, c.name, c.goal_amount, c.current_funds AS total_raised, "
                + "ISNULL(SUM(e.amount), 0) AS total_expenses, "
                + "(c.current_funds - ISNULL(SUM(e.amount), 0)) AS net_funds "
                + "FROM campaigns c "
                + "LEFT JOIN expenses e ON e.campaign_id = c.campaign_id "
                + "GROUP BY c.campaign_id, c.name, c.goal_amount, c.current_funds "
                + "ORDER BY c.created_at DESC";

        try (Connection conn = DatabaseConnection.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                ImpactReportRow row = new ImpactReportRow();
                row.setCampaignId(rs.getInt("campaign_id"));
                row.setCampaignName(rs.getString("name"));
                row.setGoalAmount(rs.getBigDecimal("goal_amount"));
                row.setTotalRaised(rs.getBigDecimal("total_raised"));
                row.setTotalExpenses(rs.getBigDecimal("total_expenses"));
                row.setNetFunds(rs.getBigDecimal("net_funds"));
                rows.add(row);
            }
        } catch (SQLException e) {
            System.err.println("Error generating impact report: " + e.getMessage());
            e.printStackTrace();
        }

        return rows;
    }
}

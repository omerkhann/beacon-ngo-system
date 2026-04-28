package com.beacon;

import com.beacon.api.BeaconApiServer;

public class ApiOnly {
    public static void main(String[] args) {
        System.out.println("Beacon NGO Management System - API Server");
        System.out.println("[INFO] Starting API server on port 7000...");
        try {
            BeaconApiServer.start(7000);
            System.out.println("[OK] API server is running. Press Ctrl+C to stop.");
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to start API server: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}

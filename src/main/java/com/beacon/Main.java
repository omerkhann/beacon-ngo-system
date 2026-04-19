package com.beacon;

import com.beacon.api.BeaconApiServer;
import com.beacon.ui.MainFrame;
import javafx.application.Application;

public class Main {
    public static void main(String[] args) {
        Thread apiThread = new Thread(() -> {
            try {
                BeaconApiServer.start(7000);
            } catch (Exception e) {
                System.err.println("[API] Failed to start API server: " + e.getMessage());
            }
        });
        apiThread.setDaemon(true);
        apiThread.start();

        Application.launch(MainFrame.class, args);
    }
}
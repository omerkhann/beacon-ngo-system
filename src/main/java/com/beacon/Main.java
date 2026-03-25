package com.beacon;

import com.beacon.ui.MainFrame;

import javax.swing.SwingUtilities;

/**
 * Application launcher.
 */
public class Main {

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            MainFrame app = new MainFrame();
            app.setVisible(true);
        });
    }
}

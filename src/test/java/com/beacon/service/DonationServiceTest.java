package com.beacon.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class DonationServiceTest {

    private final DonationService service = new DonationService();

    // Negative Tests - processDonationWithReceipt()
    @Test
    void processDonationWithReceipt_withNullAmount_returnsNull() {
        assertNull(service.processDonationWithReceipt(1, 1, null));
    }

    @Test
    void processDonationWithReceipt_withZeroAmount_returnsNull() {
        assertNull(service.processDonationWithReceipt(1, 1, BigDecimal.ZERO));
    }

    @Test
    void processDonationWithReceipt_withNegativeAmount_returnsNull() {
        assertNull(service.processDonationWithReceipt(1, 1, BigDecimal.valueOf(-50)));
    }

    // Tests for processDonation()
    @Test
    void processDonation_withNegativeAmount_returnsFalse() {
        boolean result = service.processDonation(1, 1, BigDecimal.valueOf(-50));
        assertFalse(result);
    }

    @Test
    void processDonation_withZeroAmount_returnsFalse() {
        boolean result = service.processDonation(1, 1, BigDecimal.ZERO);
        assertFalse(result);
    }

    @Test
    void processDonation_withNullAmount_returnsFalse() {
        boolean result = service.processDonation(1, 1, null);
        assertFalse(result);
    }
}

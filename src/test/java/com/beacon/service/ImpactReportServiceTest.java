package com.beacon.service;

import com.beacon.dao.ImpactReportDAO;
import com.beacon.model.ImpactReportRow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ImpactReportServiceTest {

    private ImpactReportService service;
    private ImpactReportDAO reportDAO;

    @BeforeEach
    void setUp() {
        service = new ImpactReportService();
        reportDAO = mock(ImpactReportDAO.class);
        TestUtils.injectPrivateField(service, "impactReportDAO", reportDAO);
    }

    @Test
    void getImpactReportRows_returnsReportDataFromDao() {
        ImpactReportRow row = new ImpactReportRow();
        row.setCampaignId(10);
        row.setCampaignName("Water Drive");
        row.setGoalAmount(BigDecimal.valueOf(5000));
        row.setTotalRaised(BigDecimal.valueOf(3200));
        row.setTotalExpenses(BigDecimal.valueOf(800));
        row.setNetFunds(BigDecimal.valueOf(2400));

        when(reportDAO.getImpactReportRows()).thenReturn(List.of(row));

        List<ImpactReportRow> actual = service.getImpactReportRows();

        assertNotNull(actual);
        assertEquals(1, actual.size());
        assertEquals("Water Drive", actual.get(0).getCampaignName());
        verify(reportDAO).getImpactReportRows();
    }

    @Test
    void getImpactReportRows_withMultipleRows_returnsAll() {
        ImpactReportRow row1 = new ImpactReportRow();
        row1.setCampaignId(10);
        row1.setCampaignName("Water Drive");
        row1.setGoalAmount(BigDecimal.valueOf(5000));
        row1.setTotalRaised(BigDecimal.valueOf(3200));
        row1.setTotalExpenses(BigDecimal.valueOf(800));
        row1.setNetFunds(BigDecimal.valueOf(2400));

        ImpactReportRow row2 = new ImpactReportRow();
        row2.setCampaignId(11);
        row2.setCampaignName("Food Bank");
        row2.setGoalAmount(BigDecimal.valueOf(3000));
        row2.setTotalRaised(BigDecimal.valueOf(2800));
        row2.setTotalExpenses(BigDecimal.valueOf(500));
        row2.setNetFunds(BigDecimal.valueOf(2300));

        when(reportDAO.getImpactReportRows()).thenReturn(List.of(row1, row2));

        List<ImpactReportRow> actual = service.getImpactReportRows();

        assertNotNull(actual);
        assertEquals(2, actual.size());
        assertEquals("Water Drive", actual.get(0).getCampaignName());
        assertEquals("Food Bank", actual.get(1).getCampaignName());
        verify(reportDAO).getImpactReportRows();
    }

    @Test
    void getImpactReportRows_withEmptyResult_returnsEmptyList() {
        when(reportDAO.getImpactReportRows()).thenReturn(List.of());

        List<ImpactReportRow> actual = service.getImpactReportRows();

        assertNotNull(actual);
        assertTrue(actual.isEmpty());
        verify(reportDAO).getImpactReportRows();
    }

    @Test
    void getImpactReportRows_withNullResult_returnsNull() {
        when(reportDAO.getImpactReportRows()).thenReturn(null);

        List<ImpactReportRow> actual = service.getImpactReportRows();

        assertNull(actual);
        verify(reportDAO).getImpactReportRows();
    }

    @Test
    void getImpactReportRows_verifyRowDataIntegrity() {
        ImpactReportRow row = new ImpactReportRow();
        row.setCampaignId(10);
        row.setCampaignName("Water Drive");
        row.setGoalAmount(BigDecimal.valueOf(5000));
        row.setTotalRaised(BigDecimal.valueOf(3200));
        row.setTotalExpenses(BigDecimal.valueOf(800));
        row.setNetFunds(BigDecimal.valueOf(2400));

        when(reportDAO.getImpactReportRows()).thenReturn(List.of(row));

        List<ImpactReportRow> actual = service.getImpactReportRows();

        assertNotNull(actual);
        ImpactReportRow returnedRow = actual.get(0);
        assertEquals(10, returnedRow.getCampaignId());
        assertEquals("Water Drive", returnedRow.getCampaignName());
        assertEquals(BigDecimal.valueOf(5000), returnedRow.getGoalAmount());
        assertEquals(BigDecimal.valueOf(3200), returnedRow.getTotalRaised());
        assertEquals(BigDecimal.valueOf(800), returnedRow.getTotalExpenses());
        assertEquals(BigDecimal.valueOf(2400), returnedRow.getNetFunds());
    }
}

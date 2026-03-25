package com.beacon.service;

import com.beacon.dao.ImpactReportDAO;
import com.beacon.model.ImpactReportRow;

import java.util.List;

/**
 * Service layer for impact report data.
 * Ref: US8 (Impact Report)
 */
public class ImpactReportService {

    private final ImpactReportDAO impactReportDAO;

    public ImpactReportService() {
        this.impactReportDAO = new ImpactReportDAO();
    }

    public List<ImpactReportRow> getImpactReportRows() {
        return impactReportDAO.getImpactReportRows();
    }
}

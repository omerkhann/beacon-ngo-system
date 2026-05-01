package com.beacon.service;

import com.beacon.dao.CampaignDAO;
import com.beacon.dao.ExpenseDAO;
import com.beacon.model.Campaign;
import com.beacon.model.Expense;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ExpenseServiceTest {

    private ExpenseService service;
    private ExpenseDAO expenseDAO;
    private CampaignDAO campaignDAO;

    @BeforeEach
    void setUp() {
        service = new ExpenseService();
        expenseDAO = mock(ExpenseDAO.class);
        campaignDAO = mock(CampaignDAO.class);
        TestUtils.injectPrivateField(service, "expenseDAO", expenseDAO);
        TestUtils.injectPrivateField(service, "campaignDAO", campaignDAO);
    }

    // Negative Tests - logExpense()
    @Test
    void logExpense_withNegativeAmount_returnsFalse() {
        Expense expense = new Expense();
        expense.setCampaignId(1);
        expense.setAmount(BigDecimal.valueOf(-100));

        assertFalse(service.logExpense(expense));
    }

    @Test
    void logExpense_withZeroAmount_returnsFalse() {
        Expense expense = new Expense();
        expense.setCampaignId(1);
        expense.setAmount(BigDecimal.ZERO);

        assertFalse(service.logExpense(expense));
    }

    @Test
    void logExpense_withNullAmount_returnsFalse() {
        Expense expense = new Expense();
        expense.setCampaignId(1);
        expense.setAmount(null);

        assertFalse(service.logExpense(expense));
    }

    @Test
    void logExpense_withInvalidCampaign_returnsFalse() {
        Expense expense = new Expense();
        expense.setCampaignId(-999);
        expense.setAmount(BigDecimal.valueOf(50));

        assertFalse(service.logExpense(expense));
    }

    @Test
    void logExpense_withExcessiveAmount_returnsFalse() {
        Expense expense = new Expense();
        expense.setCampaignId(1);
        expense.setAmount(BigDecimal.valueOf(99999999));

        assertFalse(service.logExpense(expense));
    }

    // Positive Tests - logExpense()
    @Test
    void logExpense_withValidExpense_returnsTrue() {
        Expense expense = new Expense();
        expense.setCampaignId(1);
        expense.setAmount(BigDecimal.valueOf(100));
        expense.setDescription("Office supplies");

        Campaign campaign = new Campaign("Test", "Desc", BigDecimal.valueOf(1000), LocalDate.now().plusDays(10), 1);
        campaign.setCurrentFunds(BigDecimal.valueOf(500));
        when(campaignDAO.getCampaignById(1)).thenReturn(campaign);
        when(expenseDAO.getTotalExpensesByCampaign(1)).thenReturn(BigDecimal.valueOf(200));
        when(expenseDAO.createExpense(expense)).thenReturn(true);

        boolean result = service.logExpense(expense);
        
        assertTrue(result);
        verify(expenseDAO).createExpense(expense);
    }

    // Tests for getTotalExpenses()
    @Test
    void getTotalExpenses_withValidCampaign_returnsTotal() {
        when(expenseDAO.getTotalExpensesByCampaign(1)).thenReturn(BigDecimal.valueOf(500));

        BigDecimal total = service.getTotalExpenses(1);

        assertNotNull(total);
        assertEquals(BigDecimal.valueOf(500), total);
        verify(expenseDAO).getTotalExpensesByCampaign(1);
    }

    @Test
    void getTotalExpenses_withInvalidCampaign_returnsZero() {
        when(expenseDAO.getTotalExpensesByCampaign(-999)).thenReturn(BigDecimal.ZERO);

        BigDecimal total = service.getTotalExpenses(-999);

        assertNotNull(total);
        verify(expenseDAO).getTotalExpensesByCampaign(-999);
    }

    // Tests for getRemainingBalance()
    @Test
    void getRemainingBalance_withValidCampaign_returnsBalance() {
        Campaign campaign = new Campaign("Test", "Desc", BigDecimal.valueOf(1000), LocalDate.now().plusDays(10), 1);
        campaign.setCurrentFunds(BigDecimal.valueOf(1000));
        when(campaignDAO.getCampaignById(1)).thenReturn(campaign);
        when(expenseDAO.getTotalExpensesByCampaign(1)).thenReturn(BigDecimal.valueOf(300));

        BigDecimal balance = service.getRemainingBalance(1);

        assertNotNull(balance);
        assertTrue(balance.doubleValue() >= 0);
    }

    @Test
    void getRemainingBalance_withInvalidCampaign_returnsZero() {
        when(campaignDAO.getCampaignById(-999)).thenReturn(null);

        BigDecimal balance = service.getRemainingBalance(-999);

        assertNotNull(balance);
        assertEquals(BigDecimal.ZERO, balance);
    }

    // Tests for getExpensesByCampaign()
    @Test
    void getExpensesByCampaign_withValidCampaign_returnsList() {
        Expense expense = new Expense();
        when(expenseDAO.getExpensesByCampaign(1)).thenReturn(List.of(expense));

        List<Expense> expenses = service.getExpensesByCampaign(1);

        assertNotNull(expenses);
        assertEquals(1, expenses.size());
        verify(expenseDAO).getExpensesByCampaign(1);
    }

    @Test
    void getExpensesByCampaign_withInvalidCampaign_returnsEmptyList() {
        when(expenseDAO.getExpensesByCampaign(-999)).thenReturn(List.of());

        List<Expense> expenses = service.getExpensesByCampaign(-999);

        assertNotNull(expenses);
        assertTrue(expenses.isEmpty());
    }

    // Tests for getAllExpenses()
    @Test
    void getAllExpenses_returnsListOfAllExpenses() {
        Expense expense = new Expense();
        when(expenseDAO.getAllExpenses()).thenReturn(List.of(expense));

        List<Expense> expenses = service.getAllExpenses();

        assertNotNull(expenses);
        assertEquals(1, expenses.size());
        verify(expenseDAO).getAllExpenses();
    }
}

package com.beacon.service;

import com.beacon.dao.VolunteerTaskDAO;
import com.beacon.model.VolunteerTask;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class VolunteerTaskServiceTest {

    private VolunteerTaskService service;
    private VolunteerTaskDAO taskDAO;

    @BeforeEach
    void setUp() throws Exception {
        service = new VolunteerTaskService();
        taskDAO = mock(VolunteerTaskDAO.class);
        TestUtils.injectPrivateField(service, "taskDAO", taskDAO);
    }

    // Negative Tests - updateTaskStatus()
    @Test
    void updateTaskStatus_withInvalidStatus_returnsFalse() {
        boolean result = service.updateTaskStatus(1, "INVALID_STATUS");

        assertFalse(result, "Invalid status values should be rejected");
        verifyNoInteractions(taskDAO);
    }

    // Positive Tests - updateTaskStatus()
    @Test
    void updateTaskStatus_withValidStatus_callsDAO() {
        when(taskDAO.updateTaskStatus(1, "In Progress")).thenReturn(true);

        boolean result = service.updateTaskStatus(1, "In Progress");

        assertTrue(result);
        verify(taskDAO).updateTaskStatus(1, "In Progress");
    }

    @Test
    void updateTaskStatus_withNotStartedStatus_callsDAO() {
        when(taskDAO.updateTaskStatus(1, "Not Started")).thenReturn(true);

        boolean result = service.updateTaskStatus(1, "Not Started");

        assertTrue(result);
        verify(taskDAO).updateTaskStatus(1, "Not Started");
    }

    // Negative Tests - updateTaskStatus() with service hours
    @Test
    void updateTaskStatusCompleted_withNegativeServiceHours_returnsFalse() {
        boolean result = service.updateTaskStatus(1, "Completed", -1.0);

        assertFalse(result, "Negative service hours should be rejected for Completed status");
        verifyNoInteractions(taskDAO);
    }

    @Test
    void updateTaskStatus_withInvalidStatus_andServiceHours_returnsFalse() {
        boolean result = service.updateTaskStatus(1, "INVALID", 5.0);

        assertFalse(result);
        verifyNoInteractions(taskDAO);
    }

    // Positive Tests - updateTaskStatus() with service hours
    @Test
    void updateTaskStatusCompleted_withValidHours_callsDao() {
        when(taskDAO.updateTaskStatus(1, "Completed", 3.0)).thenReturn(true);

        boolean result = service.updateTaskStatus(1, "Completed", 3.0);

        assertTrue(result);
        verify(taskDAO).updateTaskStatus(1, "Completed", 3.0);
    }

    @Test
    void updateTaskStatusCompleted_withZeroHours_callsDao() {
        when(taskDAO.updateTaskStatus(1, "Completed", 0.0)).thenReturn(true);

        boolean result = service.updateTaskStatus(1, "Completed", 0.0);

        assertTrue(result);
        verify(taskDAO).updateTaskStatus(1, "Completed", 0.0);
    }

    @Test
    void updateTaskStatus_withInProgressAndServiceHours_callsDao() {
        when(taskDAO.updateTaskStatus(1, "In Progress", 2.0)).thenReturn(true);

        boolean result = service.updateTaskStatus(1, "In Progress", 2.0);

        assertTrue(result);
        verify(taskDAO).updateTaskStatus(1, "In Progress", 2.0);
    }

    // Tests for createTask()
    @Test
    void createTask_withValidInput_callsDAO() {
        when(taskDAO.createTask(any(VolunteerTask.class))).thenReturn(true);

        boolean result = service.createTask(1, 1, "Water Collection", "Collect water for the village");

        assertTrue(result);
        verify(taskDAO).createTask(any(VolunteerTask.class));
    }

    // Tests for getTasksByCampaignId()
    @Test
    void getTasksByCampaignId_withValidCampaignId_callsDAO() {
        VolunteerTask task = new VolunteerTask(1, 1, "Task 1", "Description");
        when(taskDAO.getTasksByCampaignId(1)).thenReturn(List.of(task));

        List<VolunteerTask> result = service.getTasksByCampaignId(1);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(taskDAO).getTasksByCampaignId(1);
    }

    @Test
    void getTasksByCampaignId_withInvalidCampaignId_returnsEmptyList() {
        when(taskDAO.getTasksByCampaignId(-1)).thenReturn(List.of());

        List<VolunteerTask> result = service.getTasksByCampaignId(-1);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(taskDAO).getTasksByCampaignId(-1);
    }

    // Tests for getTasksByVolunteerId()
    @Test
    void getTasksByVolunteerId_withValidVolunteerId_callsDAO() {
        VolunteerTask task = new VolunteerTask(1, 1, "Task 1", "Description");
        when(taskDAO.getTasksByVolunteerId(1)).thenReturn(List.of(task));

        List<VolunteerTask> result = service.getTasksByVolunteerId(1);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(taskDAO).getTasksByVolunteerId(1);
    }

    @Test
    void getTasksByVolunteerId_withMultipleTasks_returnsList() {
        VolunteerTask task1 = new VolunteerTask(1, 1, "Task 1", "Description 1");
        VolunteerTask task2 = new VolunteerTask(1, 1, "Task 2", "Description 2");
        when(taskDAO.getTasksByVolunteerId(1)).thenReturn(List.of(task1, task2));

        List<VolunteerTask> result = service.getTasksByVolunteerId(1);

        assertNotNull(result);
        assertEquals(2, result.size());
        verify(taskDAO).getTasksByVolunteerId(1);
    }

    // Tests for getTaskById()
    @Test
    void getTaskById_withValidTaskId_returnsTask() {
        VolunteerTask task = new VolunteerTask(1, 1, "Task 1", "Description");
        when(taskDAO.getTaskById(1)).thenReturn(task);

        VolunteerTask result = service.getTaskById(1);

        assertNotNull(result);
        assertEquals("Task 1", result.getTitle());
        verify(taskDAO).getTaskById(1);
    }

    @Test
    void getTaskById_withInvalidTaskId_returnsNull() {
        when(taskDAO.getTaskById(-1)).thenReturn(null);

        VolunteerTask result = service.getTaskById(-1);

        assertNull(result);
        verify(taskDAO).getTaskById(-1);
    }
}

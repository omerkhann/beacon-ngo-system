package com.beacon.service;

import com.beacon.dao.UserDAO;
import com.beacon.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserService service;
    private UserDAO userDAO;

    @BeforeEach
    void setUp() {
        service = new UserService();
        userDAO = mock(UserDAO.class);
        TestUtils.injectPrivateField(service, "userDAO", userDAO);
    }

    // Negative Tests - authenticate()
    @Test
    void authenticate_withNullUsername_returnsNull() {
        assertNull(service.authenticate(null, "Password1"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void authenticate_withEmptyUsername_returnsNull() {
        assertNull(service.authenticate("   ", "Password1"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void authenticate_withNullPassword_returnsNull() {
        assertNull(service.authenticate("testuser", null));
        verifyNoInteractions(userDAO);
    }

    // Positive Tests - authenticate()
    @Test
    void authenticate_withValidCredentials_callsDAOAndReturnsUser() {
        User expected = new User("john", "Password1", "John Doe", "john@example.com", "DONOR");
        when(userDAO.authenticate("john", "Password1")).thenReturn(expected);

        User actual = service.authenticate("john", "Password1");

        assertNotNull(actual);
        assertEquals("john", actual.getUsername());
        verify(userDAO).authenticate("john", "Password1");
    }

    @Test
    void authenticate_withInvalidCredentials_returnsNull() {
        when(userDAO.authenticate("john", "wrongpass")).thenReturn(null);

        User actual = service.authenticate("john", "wrongpass");

        assertNull(actual);
        verify(userDAO).authenticate("john", "wrongpass");
    }

    // Negative Tests - createUser()
    @Test
    void createUser_withNullUsername_returnsNull() {
        assertNull(service.createUser(null, "Password1", "John Doe", "john@example.com", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withEmptyUsername_returnsNull() {
        assertNull(service.createUser("   ", "Password1", "John Doe", "john@example.com", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withTooShortUsername_returnsNull() {
        assertNull(service.createUser("ab", "Password1", "John Doe", "john@example.com", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withNullPassword_returnsNull() {
        assertNull(service.createUser("testuser", null, "John Doe", "john@example.com", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withTooShortPassword_returnsNull() {
        assertNull(service.createUser("testuser", "pass", "John Doe", "john@example.com", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withPasswordNoUppercase_returnsNull() {
        assertNull(service.createUser("testuser", "password1", "John Doe", "john@example.com", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withPasswordNoNumber_returnsNull() {
        assertNull(service.createUser("testuser", "Password", "John Doe", "john@example.com", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withInvalidPassword_returnsNull() {
        assertNull(service.createUser("testuser", "pass", "John Doe", "john@example.com", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withNullFullName_returnsNull() {
        assertNull(service.createUser("testuser", "Password1", null, "john@example.com", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withEmptyFullName_returnsNull() {
        assertNull(service.createUser("testuser", "Password1", "   ", "john@example.com", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withInvalidEmail_returnsNull() {
        assertNull(service.createUser("testuser", "Password1", "John Doe", "invalidemail", "DONOR"));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withNullRole_returnsNull() {
        assertNull(service.createUser("testuser", "Password1", "John Doe", "john@example.com", null));
        verifyNoInteractions(userDAO);
    }

    @Test
    void createUser_withInvalidRole_returnsNull() {
        assertNull(service.createUser("testuser", "Password1", "John Doe", "john@example.com", "ADMIN"));
        verifyNoInteractions(userDAO);
    }

    // Positive Tests - createUser()
    @Test
    void createUser_withValidInput_callsDaoAndReturnsUser() {
        User expected = new User("john", "Password1", "John Doe", "john@example.com", "DONOR");
        when(userDAO.createUser(any(User.class))).thenReturn(expected);

        User actual = service.createUser("john", "Password1", "John Doe", "john@example.com", "DONOR");

        assertNotNull(actual);
        assertEquals("john", actual.getUsername());
        verify(userDAO).createUser(any(User.class));
    }

    @Test
    void createUser_withVolunteerRole_succeeds() {
        User expected = new User("jane", "Password1", "Jane Doe", "jane@example.com", "VOLUNTEER");
        when(userDAO.createUser(any(User.class))).thenReturn(expected);

        User actual = service.createUser("jane", "Password1", "Jane Doe", "jane@example.com", "VOLUNTEER");

        assertNotNull(actual);
        assertEquals("VOLUNTEER", actual.getRole());
        verify(userDAO).createUser(any(User.class));
    }

    // Tests for getUserById()
    @Test
    void getUserById_withValidId_callsDaoAndReturnsUser() {
        User expected = new User("john", "Password1", "John Doe", "john@example.com", "DONOR");
        when(userDAO.getUserById(1)).thenReturn(expected);

        User actual = service.getUserById(1);

        assertNotNull(actual);
        assertEquals("john", actual.getUsername());
        verify(userDAO).getUserById(1);
    }

    @Test
    void getUserById_withInvalidId_returnsNull() {
        when(userDAO.getUserById(-1)).thenReturn(null);

        User actual = service.getUserById(-1);

        assertNull(actual);
        verify(userDAO).getUserById(-1);
    }

    // Tests for getUserByUsername()
    @Test
    void getUserByUsername_withValidUsername_returnsUser() {
        User expected = new User("john", "Password1", "John Doe", "john@example.com", "DONOR");
        when(userDAO.getUserByUsername("john")).thenReturn(expected);

        User actual = service.getUserByUsername("john");

        assertNotNull(actual);
        assertEquals("john", actual.getUsername());
        verify(userDAO).getUserByUsername("john");
    }

    @Test
    void getUserByUsername_withNullUsername_returnsNull() {
        assertNull(service.getUserByUsername(null));
        verifyNoInteractions(userDAO);
    }

    @Test
    void getUserByUsername_withEmptyUsername_returnsNull() {
        assertNull(service.getUserByUsername("   "));
        verifyNoInteractions(userDAO);
    }
}

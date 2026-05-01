package com.beacon.service;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertTrue;

public final class TestUtils {
    private TestUtils() {
    }

    public static void injectPrivateField(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException("Failed to inject private field: " + fieldName, e);
        }
    }

    public static <T> void assertIsInstance(Object obj, Class<T> expectedType) {
        assertTrue(expectedType.isInstance(obj),
                "Expected object to be instance of " + expectedType.getName() +
                        " but was " + (obj == null ? "null" : obj.getClass().getName()));
    }
}

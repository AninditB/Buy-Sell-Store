package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.AuthResponse;
import com.buyandsellstore.app.model.Address;
import com.buyandsellstore.app.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class UserServiceUpdateTest {

    @Autowired
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create or fetch a reusable test user
        AuthResponse resp = createOrFetchTestUser();
        testUser = resp.getUser();

        // Reset mutable fields to a known baseline
        testUser.setPhone("1234567890");
        testUser.setProfilePictureUrl(null);
        testUser.setBilling(List.of());
        testUser.setShipping(List.of());
        testUser.setPrimaryBillingIndex(null);
        testUser.setPrimaryShippingIndex(null);
        userService.save(testUser);
    }

    private AuthResponse createOrFetchTestUser() {
        User existing = userService.existByUserName("junitUpdateUser");
        if (existing != null) {
            return new AuthResponse(true, "User exists", existing);
        }
        return userService.createUser(new User(
                "junitUpdateUser",
                "junit.update@test.com",
                "updatePass123",
                "Update",
                "Tester",
                "0001112222",
                false));
    }

    @Test
    void testUpdateUser_AllFields() {
        // Prepare new values
        String newPhone = "9998887777";
        String newPic = "http://example.com/new-pic.png";
        List<Address> newBilling = List.of(
                new Address("HOME", "100 New Home St", "CityA", "ST", 12345, "USA"));
        List<Address> newShipping = List.of(
                new Address("WORK", "200 New Work Rd", "CityB", "ST", 54321, "USA"),
                new Address("OTHER", "300 Other Ln", "CityC", "ST", 67890, "USA"));
        Integer newPrimaryBilling = 0;
        Integer newPrimaryShipping = 1;

        // Execute update
        User updated = userService.updateUser(
                testUser.getId(),
                newPhone,
                newPic,
                newBilling,
                newShipping,
                newPrimaryBilling,
                newPrimaryShipping);

        // Assertions
        assertEquals(newPhone, updated.getPhone());
        assertEquals(newPic, updated.getProfilePictureUrl());

        assertEquals(1, updated.getBilling().size());
        assertEquals("100 New Home St", updated.getBilling().get(0).getStreet());
        assertEquals(12345, updated.getBilling().get(0).getZip());

        assertEquals(2, updated.getShipping().size());
        assertEquals("200 New Work Rd", updated.getShipping().get(0).getStreet());
        assertEquals(54321, updated.getShipping().get(0).getZip());
        assertEquals("300 Other Ln", updated.getShipping().get(1).getStreet());
        assertEquals(67890, updated.getShipping().get(1).getZip());

        assertEquals(newPrimaryBilling, updated.getPrimaryBillingIndex());
        assertEquals(newPrimaryShipping, updated.getPrimaryShippingIndex());
    }

    @Test
    void testUpdateUser_PartialFields() {
        // Seed initial non-null values
        testUser.setPhone("5554443333");
        testUser.setProfilePictureUrl("http://old.url/pic.png");
        testUser.setBilling(List.of(
                new Address("OLD", "1 Old St", "CityX", "ST", 0, "USA")));
        testUser.setPrimaryBillingIndex(0);
        userService.save(testUser);

        // Only update phone and shipping
        String updatedPhone = "2223334444";
        List<Address> newShipping = List.of(
                new Address("SHIP", "50 Ship Rd", "CityY", "ST", 11111, "USA"));

        User updated = userService.updateUser(
                testUser.getId(),
                updatedPhone,
                null, // leave profilePictureUrl untouched
                null, // leave billing untouched
                newShipping,
                null, // leave primaryBillingIndex untouched
                0 // set primaryShippingIndex
        );

        // Verify
        assertEquals(updatedPhone, updated.getPhone());
        assertEquals("http://old.url/pic.png", updated.getProfilePictureUrl());

        assertEquals(1, updated.getBilling().size());
        assertEquals("1 Old St", updated.getBilling().get(0).getStreet());
        assertEquals(0, updated.getBilling().get(0).getZip());

        assertEquals(1, updated.getShipping().size());
        assertEquals("50 Ship Rd", updated.getShipping().get(0).getStreet());
        assertEquals(11111, updated.getShipping().get(0).getZip());

        assertEquals(0, updated.getPrimaryBillingIndex());
        assertEquals(0, updated.getPrimaryShippingIndex());
    }

    @Test
    void testUpdateUser_UserNotFound() {
        String fakeId = "nonexistent-id-123";
        assertThrows(NoSuchElementException.class, () -> userService.updateUser(
                fakeId,
                "000", "url",
                List.of(), List.of(),
                0, 0));
    }
}

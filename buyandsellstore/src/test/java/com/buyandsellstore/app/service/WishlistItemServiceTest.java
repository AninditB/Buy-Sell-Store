/*to run tests , go to cd /Users/mohitsharma/Desktop/softproj/CS5394.Group3/buyandsellstore
 then mvn test
 * Test Cases for WishlistItemService:
 *
 * 1. Add Wishlist Item Test:
 *    - Purpose: Verify that the service correctly saves a wishlist item by calling the repository's save method.
 *    - Relevance: Ensures that the "create" operation in CRUD is working as expected.
 *
 * 2. Get Wishlist Item by ID Test:
 *    - Purpose: Check that a wishlist item can be retrieved by its unique ID.
 *    - Relevance: Validates the "read" operation for individual items.
 *
 * 3. Get Wishlist Items by User ID Test:
 *    - Purpose: Ensure that all wishlist items associated with a specific user are returned.
 *    - Relevance: Confirms that the service properly filters items by user, which is crucial for delivering personalized data.
 *
 * 4. Remove Wishlist Item Test:
 *    - Purpose: Confirm that the service correctly deletes a wishlist item by its ID using the repository's deleteById method.
 *    - Relevance: Verifies the "delete" functionality, ensuring unwanted items can be removed.
 */

package com.buyandsellstore.app.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.buyandsellstore.app.model.WishlistItem;
import com.buyandsellstore.app.repository.WishlistItemRepository;
import com.buyandsellstore.app.service.WishlistItemService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public class WishlistItemServiceTest {

    @Mock
    private WishlistItemRepository wishlistItemRepository;

    @InjectMocks
    private WishlistItemService wishlistItemService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testAddWishlistItem() {
        WishlistItem item = new WishlistItem();
        item.setId("1");
        item.setUserId("user1");
        item.setItemId("book1");
        item.setType("book");
        item.setName("Test Book");
        item.setImageUrl("http://example.com/testbook.jpg");

        when(wishlistItemRepository.save(item)).thenReturn(item);

        WishlistItem result = wishlistItemService.addWishlistItem(item);
        assertNotNull(result, "Wishlist item should not be null");
        assertEquals("Test Book", result.getName(), "Wishlist item name should match");
    }

    @Test
    public void testGetWishlistItemById() {
        WishlistItem item = new WishlistItem();
        item.setId("1");
        item.setUserId("user1");
        item.setItemId("book1");
        item.setType("book");
        item.setName("Test Book");
        item.setImageUrl("http://example.com/testbook.jpg");

        when(wishlistItemRepository.findById("1")).thenReturn(Optional.of(item));

        Optional<WishlistItem> result = wishlistItemService.getWishlistItemById("1");
        assertTrue(result.isPresent(), "Wishlist item should be present");
        assertEquals("user1", result.get().getUserId(), "UserId should match");
    }

    @Test
    public void testGetWishlistItemsByUserId() {
        WishlistItem item1 = new WishlistItem();
        item1.setId("1");
        item1.setUserId("user1");
        item1.setItemId("book1");
        item1.setType("book");
        item1.setName("Test Book");
        item1.setImageUrl("http://example.com/testbook.jpg");

        WishlistItem item2 = new WishlistItem();
        item2.setId("2");
        item2.setUserId("user1");
        item2.setItemId("book2");
        item2.setType("book");
        item2.setName("Another Book");
        item2.setImageUrl("http://example.com/anotherbook.jpg");

        List<WishlistItem> list = Arrays.asList(item1, item2);
        when(wishlistItemRepository.findByUserId("user1")).thenReturn(list);

        List<WishlistItem> result = wishlistItemService.getWishlistItemsByUserId("user1");
        assertEquals(2, result.size(), "Should return two wishlist items");
    }

    @Test
    public void testRemoveWishlistItem() {
        // For remove, simply verify that deleteById is called.
        doNothing().when(wishlistItemRepository).deleteById("1");

        wishlistItemService.removeWishlistItem("1");
        verify(wishlistItemRepository, times(1)).deleteById("1");
    }
}

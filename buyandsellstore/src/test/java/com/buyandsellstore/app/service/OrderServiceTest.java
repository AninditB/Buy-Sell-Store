package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.OrderResponse;
import com.buyandsellstore.app.model.*;
import com.buyandsellstore.app.repository.BookRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class OrderServiceTest {
    @Autowired
    private OrderService orderService;

    @Autowired
    private BookRepository bookRepository;

    private Book savedBook;

    private final String testSellerId = "junitTestUser";

    private OrderResponse createOrderBeforeTest(){
        List<CartItem> cartItemList = new ArrayList<>();
        //Book(String title, String author, double price, String imageUrl, String description, String sellerId, String type)
        Book book = new Book("test title", "testauthor", 8.99, "test url", "test description", testSellerId, "book");
        savedBook = bookRepository.save(book);
        cartItemList.add(new CartItem(savedBook.getId(), "book", savedBook.getTitle(), 2, savedBook.getPrice(), savedBook.getImageUrl()));
        OrderResponse orderResponse = orderService.createOrder(
                testSellerId,
                cartItemList,
                (float) (savedBook.getTotalQuantity() * savedBook.getPrice()),
                new Address("test type", "test street", "test city", "TX", 123, "USA"),
                new Address("test type", "test street", "test city", "TX", 123, "USA"),
                new Payment("123456789012", "25/25", "123")
        );
        return orderResponse;
    }

    private long deleteOrderAfterTest(){
        bookRepository.delete(savedBook);
        return orderService.removeOrderByUserId(testSellerId);
    }

    @Test
    void testOrderPlacement() {
        OrderResponse orderResponse = createOrderBeforeTest();
        assertNotNull(orderResponse);
        assertTrue(orderResponse.isSuccess());
        long count = deleteOrderAfterTest();
        assertNotEquals(0, count);
    }

    @Test
    void testOrderHistoryRetrieval() {
        OrderResponse orderResponse = createOrderBeforeTest();
        List<Order> orders = orderService.getOrdersByUserId(testSellerId);
        assertNotNull(orders);
        assertTrue(orders.size() > 0);
        long count = deleteOrderAfterTest();
        assertNotEquals(0, count);
    }

    @Test
    void testSoldItemsBySellerId() {
        // Step 1: Create order
        OrderResponse orderResponse = createOrderBeforeTest();
        assertNotNull(orderResponse);
        assertTrue(orderResponse.isSuccess());

        // Step 2: Fetch sold items
        List<SoldItem> soldItems = orderService.getSoldItemsBySellerId(testSellerId);
        assertNotNull(soldItems, "Sold items list should not be null");
        assertFalse(soldItems.isEmpty(), "Sold items list should not be empty");

        // Step 3: Validate sold item data
        SoldItem soldItem = soldItems.get(0);
        assertEquals(testSellerId, soldItem.getSellerId(), "SellerId should match the test seller id");
        assertEquals("test title", soldItem.getName(), "Item name should match the test item");
        assertEquals(2, soldItem.getQuantity(), "Quantity should match");

        // Step 4: Cleanup
        long count = deleteOrderAfterTest();
        assertNotEquals(0, count);
    }
}

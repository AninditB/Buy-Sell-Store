package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.AuthResponse;
import com.buyandsellstore.app.dto.ResponseMessage;
import com.buyandsellstore.app.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class CartServieTest {

    @Autowired
    private UserService userService;
    @Autowired
    private CartService cartService;

    AuthResponse createTestUser(){
        User user = userService.existByUserName("junitTestUser");
        if(user != null){
            return new AuthResponse(true,"User exists!", user);
        }
        return userService.createUser(new User("junitTestUser","junit@test.com","test12345678",
                "test", "test", "1234567890", false));
    }

//    @Test
////    void testGetAllCartItemsForUser() {
////        User user = createTestUser().getUser();
////        var items = cartService.getAllCartItemsForUser(user.getId());
////        assertFalse(items.isEmpty());
////    }
//
    @Test
    void testAddToCart() {
        User user = createTestUser().getUser();
        ResponseMessage responseMessage = cartService.addToCart(user.getId(), "test", "test");
        assertNotNull(responseMessage);
        assertTrue(responseMessage.isSuccess());
    }

}

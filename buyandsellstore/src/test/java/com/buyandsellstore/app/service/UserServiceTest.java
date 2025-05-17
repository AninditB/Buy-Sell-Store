package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.AuthResponse;
import com.buyandsellstore.app.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class UserServiceTest {
    @Autowired
    UserService userService;

    AuthResponse createTestUser(){
        User user = userService.existByUserName("junitTestUser");
        if(user != null){
            return new AuthResponse(true,"User exists", user);
        }
        return userService.createUser(new User("junitTestUser","junit@test.com","test12345678",
                "test", "test", "1234567890", false));
    }

    @Test
    void testLogin(){
        AuthResponse response = createTestUser();
        User user = userService.authenticate("junitTestUser", "test12345678");
        assertNotNull(user);
    }

    @Test
    void testSignup(){
        AuthResponse response = createTestUser();
        User user = userService.authenticate("junitTestUser", "test12345678");
        assertNotNull(user);
    }
}

package com.buyandsellstore.app.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.buyandsellstore.app.model.PasswordResetToken;
import com.buyandsellstore.app.model.User;
import com.buyandsellstore.app.repository.PasswordResetTokenRepository;
import com.buyandsellstore.app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

public class PasswordResetServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    /**
     * Test creating a password reset token for a valid user.
     * Expected: A token is generated, saved, and an email is sent.
     */
    @Test
    public void testCreatePasswordResetToken_ValidEmail() {
        User user = new User();
        user.setId("user1");
        user.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com")).thenReturn(user);
        // TokenRepository.save() will simply return the same token object, so no stub
        // needed

        String token = passwordResetService.createPasswordResetToken("test@example.com");

        // Verify that the token was saved and an email was sent
        verify(tokenRepository, times(1)).save(any(PasswordResetToken.class));
        verify(emailService, times(1)).sendPasswordResetEmail(eq("test@example.com"), contains(token));
        assertNotNull(token, "Token should not be null");
    }

    /**
     * Test creating a password reset token for an invalid email.
     * Expected: RuntimeException is thrown when user is not found.
     */
    @Test
    public void testCreatePasswordResetToken_InvalidEmail() {
        when(userRepository.findByEmail("invalid@example.com")).thenReturn(null);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            passwordResetService.createPasswordResetToken("invalid@example.com");
        });

        String expectedMessage = "User not found with email: invalid@example.com";
        String actualMessage = exception.getMessage();
        assertTrue(actualMessage.contains(expectedMessage));
    }

    /**
     * Test validating a valid (non-expired) token.
     */
    @Test
    public void testValidatePasswordResetToken_ValidToken() {
        PasswordResetToken token = new PasswordResetToken("valid-token", "user1", LocalDateTime.now().plusMinutes(30));
        when(tokenRepository.findByToken("valid-token")).thenReturn(token);

        boolean isValid = passwordResetService.validatePasswordResetToken("valid-token");
        assertTrue(isValid, "Token should be valid");
    }

    /**
     * Test validating an expired token.
     */
    @Test
    public void testValidatePasswordResetToken_ExpiredToken() {
        PasswordResetToken token = new PasswordResetToken("expired-token", "user1",
                LocalDateTime.now().minusMinutes(10));
        when(tokenRepository.findByToken("expired-token")).thenReturn(token);

        boolean isValid = passwordResetService.validatePasswordResetToken("expired-token");
        assertFalse(isValid, "Token should be invalid as it is expired");
    }

    /**
     * Test resetting password with a valid token.
     * Expected: Password is updated, token is deleted, and the token is considered
     * valid.
     */
    @Test
    public void testResetPassword_ValidToken() {
        PasswordResetToken token = new PasswordResetToken("valid-token", "user1", LocalDateTime.now().plusMinutes(30));
        User user = new User();
        user.setId("user1");
        user.setPassword("oldPassword");

        when(tokenRepository.findByToken("valid-token")).thenReturn(token);
        when(userRepository.findById("user1")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPassword")).thenReturn("hashedNewPassword");

        boolean result = passwordResetService.resetPassword("valid-token", "newPassword");
        assertTrue(result, "Password reset should succeed with a valid token");

        verify(userRepository, times(1)).save(user);
        verify(tokenRepository, times(1)).delete(token);
        assertEquals("hashedNewPassword", user.getPassword(), "User's password should be updated");
    }

    /**
     * Test resetting password with an invalid token.
     * Expected: The method returns false when token is not found.
     */
    @Test
    public void testResetPassword_InvalidToken() {
        when(tokenRepository.findByToken("invalid-token")).thenReturn(null);

        boolean result = passwordResetService.resetPassword("invalid-token", "newPassword");
        assertFalse(result, "Password reset should fail with an invalid token");

        verify(userRepository, never()).save(any(User.class));
        verify(tokenRepository, never()).delete(any(PasswordResetToken.class));
    }
}

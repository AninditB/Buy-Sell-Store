package com.buyandsellstore.app.service;

import com.buyandsellstore.app.model.PasswordResetToken;
import com.buyandsellstore.app.model.User;
import com.buyandsellstore.app.repository.PasswordResetTokenRepository;
import com.buyandsellstore.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;
    
    // Autowire the PasswordEncoder to hash the new password
    @Autowired
    private PasswordEncoder passwordEncoder;

    public String createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found with email: " + email);
        }
        // Generate a secure token (using UUID for simplicity)
        String token = UUID.randomUUID().toString();
        // Set token expiry (e.g., 1 hour from now)
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);

        PasswordResetToken resetToken = new PasswordResetToken(token, user.getId(), expiryDate);
        tokenRepository.save(resetToken);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(email, resetLink);
        return token;
    }

    public boolean validatePasswordResetToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        return resetToken != null && !resetToken.getExpiryDate().isBefore(LocalDateTime.now());
    }

    public boolean resetPassword(String token, String newPassword) {
        // Retrieve the token from the repository
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        if (resetToken == null || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false; // Token is invalid or expired
        }

        // Retrieve the associated user
        Optional<User> optionalUser = userRepository.findById(resetToken.getUserId());
        if (!optionalUser.isPresent()) {
            return false; // User not found
        }
        User user = optionalUser.get();

        // Hash the new password before updating the user record
        String hashedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(hashedPassword);

        // Save the updated user
        userRepository.save(user);

        // Invalidate the token by deleting it
        tokenRepository.delete(resetToken);

        return true;
    }
}

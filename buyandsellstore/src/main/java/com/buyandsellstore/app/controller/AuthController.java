package com.buyandsellstore.app.controller;

import com.buyandsellstore.app.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private PasswordResetService passwordResetService;

    // Endpoint to request a password reset
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String username) {
        String token = passwordResetService.createPasswordResetToken(username);
        // In a real application, you'd send the token via email instead of returning it
        // in the response
        return ResponseEntity.ok("Password reset token: " + token);
    }

    // Endpoint to reset the password using the token
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token,
            @RequestParam String newPassword) {
        if (!passwordResetService.validatePasswordResetToken(token)) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }
        // Update the user's password here (e.g., userService.updatePassword(userId,
        // newPassword))
        return ResponseEntity.ok("Password has been reset successfully");
    }
}
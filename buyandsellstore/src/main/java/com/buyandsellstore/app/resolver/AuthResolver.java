package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.ResetPasswordResponse;
import com.buyandsellstore.app.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class AuthResolver {

    @Autowired
    private PasswordResetService passwordResetService;

    @MutationMapping
    public String forgotPassword(@Argument String email) {
        return passwordResetService.createPasswordResetToken(email);
    }

    @MutationMapping
    public ResetPasswordResponse resetPassword(@Argument String token, @Argument String newPassword) {
        try {
            boolean reset = passwordResetService.resetPassword(token, newPassword);
            if (reset) {
                return new ResetPasswordResponse(true, "Password reset successfully.");
            } else {
                return new ResetPasswordResponse(false, "Invalid or expired token.");
            }
        } catch (Exception e) {
            // Log the error as needed
            return new ResetPasswordResponse(false, "An unexpected error occurred.");
        }
    }

}
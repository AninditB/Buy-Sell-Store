package com.buyandsellstore.app.dto;

public class ResetPasswordResponse {
    private boolean success;
    private String message;

    public ResetPasswordResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Getters and setters

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
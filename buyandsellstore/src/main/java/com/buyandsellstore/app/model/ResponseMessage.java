package com.buyandsellstore.app.model;

public class ResponseMessage {
    private boolean success;
    private String message;

    // Default constructor
    public ResponseMessage() {
    }

    // Parameterized constructor
    public ResponseMessage(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Getters and Setters
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

    @Override
    public String toString() {
        return "ResponseMessage{" +
                "success=" + success +
                ", message='" + message + '\'' +
                '}';
    }
}

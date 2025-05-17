package com.buyandsellstore.app.dto;

import com.buyandsellstore.app.model.Book;

public class UploadBookResponse {

    private boolean success;
    private String message;
    private Book book;

    public UploadBookResponse() {
    }

    public UploadBookResponse(boolean success, String message, Book book) {
        this.success = success;
        this.message = message;
        this.book = book;
    }

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

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    @Override
    public String toString() {
        return "UploadBookResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", book=" + book +
                '}';
    }
}

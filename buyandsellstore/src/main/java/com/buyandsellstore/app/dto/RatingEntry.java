package com.buyandsellstore.app.dto;

public class RatingEntry {
    private String bookId;
    private double averageRating;

    public RatingEntry(String bookId, double averageRating) {
        this.bookId = bookId;
        this.averageRating = averageRating;
    }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
}

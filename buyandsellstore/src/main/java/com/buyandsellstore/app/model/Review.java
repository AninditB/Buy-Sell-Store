package com.buyandsellstore.app.model;

public class Review {
    private String reviewer;
    private String comment;
    private double rating;
    private String userId;

    public Review() {
    }

    public Review(String reviewer, String comment, double rating) {
        this.reviewer = reviewer;
        this.comment = comment;
        this.rating = rating;
    }

    public String getReviewer() {
        return reviewer;
    }

    public void setReviewer(String reviewer) {
        this.reviewer = reviewer;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @Override
    public String toString() {
        return "Review{" +
                "reviewer='" + reviewer + '\'' +
                ", comment='" + comment + '\'' +
                ", rating=" + rating +
                ", userId='" + userId + '\'' +
                '}';
    }
}

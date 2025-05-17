package com.buyandsellstore.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "books")
public class Book {

    @Id
    private String id; // Unique identifier for MongoDB
    private String title;
    private String type;
    private String author;
    private double price;
    private String imageUrl;
    private String description;
    private double ratings;
    private String sellerId;

    private int totalQuantity;
    @Field("reviews") // MongoDB field for embedded reviews
    private List<Review> reviews;
    public Book(){

    }
    public Book(String title, String author, double price, String imageUrl, String description, String sellerId, String type) {
        this.title = title;
        this.author = author;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this.sellerId = sellerId;
        this.type = type;
    }

    public Book(String title, String author, double price, String imageUrl, String description, String sellerId, int totalQuantity) {
        this.title = title;
        this.author = author;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this.sellerId = sellerId;
        this.totalQuantity = totalQuantity;
    }

    public Book(String title, String author, double price, String imageUrl, String description, String sellerId, List<Review> reviews) {
        this.title = title;
        this.author = author;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this.sellerId = sellerId;
        this.reviews = reviews;
    }

    // Getters and Setters for all fields, including id
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getRatings() {
        return ratings;
    }

    public void setRatings(double ratings) {
        this.ratings = ratings;
    }

    public List<Review> getReviews() {
        return reviews;
    }

    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public int getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(int totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "Book{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", type='" + type + '\'' +
                ", author='" + author + '\'' +
                ", price=" + price +
                ", imageUrl='" + imageUrl + '\'' +
                ", description='" + description + '\'' +
                ", ratings=" + ratings +
                ", sellerId='" + sellerId + '\'' +
                ", totalQuantity=" + totalQuantity +
                ", reviews=" + reviews +
                '}';
    }
}

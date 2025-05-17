package com.buyandsellstore.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "homeItems")
public class HomeItem {

    @Id
    private String id; // Unique identifier for MongoDB
    private String title;
    private String type;
    private String description;
    private double price;
    private String imageUrl;
    private String manufacturer;
    private double ratings;
    private String sellerId;

    private int totalQuantity;

    @Field("reviews") // MongoDB field for embedded reviews
    private List<Review> reviews;

    public HomeItem() {
    }

    public HomeItem(String title, String type, String description, double price, String imageUrl, String manufacturer, String sellerId) {
        this.title = title;
        this.type = type;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.manufacturer = manufacturer;
        this.ratings = ratings;
        this.sellerId = sellerId;
    }

    public HomeItem(String title, String type, String description, double price, String imageUrl, String manufacturer, String sellerId, int totalQuantity) {
        this.title = title;
        this.type = type;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.manufacturer = manufacturer;
        this.ratings = ratings;
        this.sellerId = sellerId;
        this.totalQuantity = totalQuantity;
    }

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public double getRatings() {
        return ratings;
    }

    public void setRatings(double ratings) {
        this.ratings = ratings;
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

    public List<Review> getReviews() {
        return reviews;
    }

    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }

    @Override
    public String toString() {
        return "HomeItem{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", type='" + type + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                ", imageUrl='" + imageUrl + '\'' +
                ", manufacturer='" + manufacturer + '\'' +
                ", ratings=" + ratings +
                ", sellerId='" + sellerId + '\'' +
                ", totalQuantity=" + totalQuantity +
                ", reviews=" + reviews +
                '}';
    }
}

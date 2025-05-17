package com.buyandsellstore.app.model;

import java.util.Date;

public class SoldItem {

    private String itemId; // Unique ID of the item (e.g., book ID, home item ID)
    private String type; // Type of the item (e.g., "book", "homeItem")
    private String name; // Name of the item
    private int quantity; // Quantity of the item
    private double price; // Price of the item
    private String imageUrl; // Add this field
    private String sellerId;
    private Date createdAt;

    public SoldItem() {
    }

    public SoldItem(String itemId, String type, String name, int quantity, double price, String imageUrl, String sellerId, Date createdAt) {
        this.itemId = itemId;
        this.type = type;
        this.name = name;
        this.quantity = quantity;
        this.price = price;
        this.imageUrl = imageUrl;
        this.sellerId = sellerId;
        this.createdAt = createdAt;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
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

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}

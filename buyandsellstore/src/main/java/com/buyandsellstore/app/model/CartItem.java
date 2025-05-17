package com.buyandsellstore.app.model;

public class CartItem {
    private String itemId; // Unique ID of the item (e.g., book ID, home item ID)
    private String type; // Type of the item (e.g., "book", "homeItem")
    private String name; // Name of the item
    private int quantity; // Quantity of the item
    private double price; // Price of the item
    private String imageUrl; // Add this field
    private String sellerId;
    private String productName;

    // Constructors
    public CartItem() {
    }

    public CartItem(String itemId, String type, String name, int quantity, double price, String imageUrl) {
        this.itemId = itemId;
        this.type = type;
        this.name = name;
        this.quantity = quantity;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
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
    @Override
    public String toString() {
        return "CartItem{" +
                "itemId='" + itemId + '\'' +
                ", type='" + type + '\'' +
                ", name='" + name + '\'' +
                ", quantity=" + quantity +
                ", price=" + price +
                '}';
    }
    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public String getProductName() {
        return productName;
    }
}

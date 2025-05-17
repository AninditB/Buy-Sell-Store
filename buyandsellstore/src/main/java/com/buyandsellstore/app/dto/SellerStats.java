package com.buyandsellstore.app.dto;

import com.buyandsellstore.app.model.Book;

import java.util.List;

public class SellerStats {
    private int totalBuyers;
    private int totalPurchases;
    private double totalRevenue;
    private List<Book> purchasedBooks;

    private List<RevenueEntry> revenueByDate;
    private List<Book> topSellingBooks;
    private List<Book> leastSellingBooks;
    private List<RatingEntry> averageRatings;
    private List<String> mostActiveBuyers;
    private List<PurchaseEntry> userPurchaseFrequency;
    private double cartAbandonmentRate;
    private int totalOrders;
    private List<FulfillmentEntry> orderFulfillmentDelay;
    private List<WishlistEntry> wishlistFrequency;
    private List<Book> trendingRecommendations;

    public SellerStats() {}

    public SellerStats(int totalBuyers, int totalPurchases, double totalRevenue, List<Book> purchasedBooks) {
        this.totalBuyers = totalBuyers;
        this.totalPurchases = totalPurchases;
        this.totalRevenue = totalRevenue;
        this.purchasedBooks = purchasedBooks;
    }

    public int getTotalBuyers() { return totalBuyers; }
    public void setTotalBuyers(int totalBuyers) { this.totalBuyers = totalBuyers; }

    public int getTotalPurchases() { return totalPurchases; }
    public void setTotalPurchases(int totalPurchases) { this.totalPurchases = totalPurchases; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public List<Book> getPurchasedBooks() { return purchasedBooks; }
    public void setPurchasedBooks(List<Book> purchasedBooks) { this.purchasedBooks = purchasedBooks; }

    public List<RevenueEntry> getRevenueByDate() { return revenueByDate; }
    public void setRevenueByDate(List<RevenueEntry> revenueByDate) { this.revenueByDate = revenueByDate; }

    public List<Book> getTopSellingBooks() { return topSellingBooks; }
    public void setTopSellingBooks(List<Book> topSellingBooks) { this.topSellingBooks = topSellingBooks; }

    public List<Book> getLeastSellingBooks() { return leastSellingBooks; }
    public void setLeastSellingBooks(List<Book> leastSellingBooks) { this.leastSellingBooks = leastSellingBooks; }

    public List<RatingEntry> getAverageRatings() { return averageRatings; }
    public void setAverageRatings(List<RatingEntry> averageRatings) { this.averageRatings = averageRatings; }

    public List<String> getMostActiveBuyers() { return mostActiveBuyers; }
    public void setMostActiveBuyers(List<String> mostActiveBuyers) { this.mostActiveBuyers = mostActiveBuyers; }

    public List<PurchaseEntry> getUserPurchaseFrequency() { return userPurchaseFrequency; }
    public void setUserPurchaseFrequency(List<PurchaseEntry> userPurchaseFrequency) { this.userPurchaseFrequency = userPurchaseFrequency; }

    public double getCartAbandonmentRate() { return cartAbandonmentRate; }
    public void setCartAbandonmentRate(double cartAbandonmentRate) { this.cartAbandonmentRate = cartAbandonmentRate; }

    public int getTotalOrders() { return totalOrders; }
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }

    public List<FulfillmentEntry> getOrderFulfillmentDelay() { return orderFulfillmentDelay; }
    public void setOrderFulfillmentDelay(List<FulfillmentEntry> orderFulfillmentDelay) { this.orderFulfillmentDelay = orderFulfillmentDelay; }

    public List<WishlistEntry> getWishlistFrequency() { return wishlistFrequency; }
    public void setWishlistFrequency(List<WishlistEntry> wishlistFrequency) { this.wishlistFrequency = wishlistFrequency; }

    public List<Book> getTrendingRecommendations() { return trendingRecommendations; }
    public void setTrendingRecommendations(List<Book> trendingRecommendations) { this.trendingRecommendations = trendingRecommendations; }
}

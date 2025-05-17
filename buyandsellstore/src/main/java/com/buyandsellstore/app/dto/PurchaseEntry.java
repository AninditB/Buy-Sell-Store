package com.buyandsellstore.app.dto;

public class PurchaseEntry {
    private String userId;
    private int frequency;

    public PurchaseEntry(String userId, int frequency) {
        this.userId = userId;
        this.frequency = frequency;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public int getFrequency() { return frequency; }
    public void setFrequency(int frequency) { this.frequency = frequency; }
}

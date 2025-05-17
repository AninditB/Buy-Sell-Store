package com.buyandsellstore.app.dto;

public class FulfillmentEntry {
    private String orderId;
    private float delayInHours;

    public FulfillmentEntry() {}

    public FulfillmentEntry(String orderId, float delayInHours) {
        this.orderId = orderId;
        this.delayInHours = delayInHours;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public float getDelayInHours() {
        return delayInHours;
    }

    public void setDelayInHours(float delayInHours) {
        this.delayInHours = delayInHours;
    }
}

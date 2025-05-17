package com.buyandsellstore.app.dto;

import com.buyandsellstore.app.model.HomeItem;

public class UploadHomeItemResponse {

    private boolean success;
    private String message;
    private HomeItem homeItem;

    public UploadHomeItemResponse() {
    }

    public UploadHomeItemResponse(boolean success, String message, HomeItem homeItem) {
        this.success = success;
        this.message = message;
        this.homeItem = homeItem;
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

    public HomeItem getHomeItem() {
        return homeItem;
    }

    public void setHomeItem(HomeItem homeItem) {
        this.homeItem = homeItem;
    }

    @Override
    public String toString() {
        return "UploadHomeItemResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", homeItem=" + homeItem +
                '}';
    }
}

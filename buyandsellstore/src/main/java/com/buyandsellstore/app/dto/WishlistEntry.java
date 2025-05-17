package com.buyandsellstore.app.dto;

public class WishlistEntry {
    private String bookId;
    private int count;

    public WishlistEntry() {}

    public WishlistEntry(String bookId, int count) {
        this.bookId = bookId;
        this.count = count;
    }

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}

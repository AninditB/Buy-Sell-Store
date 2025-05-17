package com.buyandsellstore.app.service;

import com.buyandsellstore.app.model.WishlistItem;
import com.buyandsellstore.app.repository.WishlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WishlistItemService {

    private final WishlistItemRepository wishlistItemRepository;

    @Autowired
    public WishlistItemService(WishlistItemRepository wishlistItemRepository) {
        this.wishlistItemRepository = wishlistItemRepository;
    }

    // Create or add a new wishlist item
    public WishlistItem addWishlistItem(WishlistItem wishlistItem) {
        return wishlistItemRepository.save(wishlistItem);
    }

    // Retrieve a wishlist item by its ID
    public Optional<WishlistItem> getWishlistItemById(String id) {
        return wishlistItemRepository.findById(id);
    }

    // Retrieve all wishlist items for a given user (assuming WishlistItem has a userId field)
    public List<WishlistItem> getWishlistItemsByUserId(String userId) {
        return wishlistItemRepository.findByUserId(userId);
    }

    // Update an existing wishlist item
    public WishlistItem updateWishlistItem(WishlistItem wishlistItem) {
        // Depending on your needs, you might check that the item exists first.
        return wishlistItemRepository.save(wishlistItem);
    }

    // Delete a wishlist item by its ID
    public void removeWishlistItem(String id) {
        wishlistItemRepository.deleteById(id);
    }
}

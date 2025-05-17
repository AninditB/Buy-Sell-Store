package com.buyandsellstore.app.repository;

import com.buyandsellstore.app.model.WishlistItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface WishlistItemRepository extends MongoRepository<WishlistItem, String> {
    // Spring Data will implement this method automatically based on the field "userId" in WishlistItem
    List<WishlistItem> findByUserId(String userId);
}

package com.buyandsellstore.app.repository;

import com.buyandsellstore.app.model.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByUserId(String userId); // Add this method
}

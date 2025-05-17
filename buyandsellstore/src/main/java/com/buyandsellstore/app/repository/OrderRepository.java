package com.buyandsellstore.app.repository;

import com.buyandsellstore.app.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserId(String userId); // Add this method
    long removeByUserId(String userId);
}

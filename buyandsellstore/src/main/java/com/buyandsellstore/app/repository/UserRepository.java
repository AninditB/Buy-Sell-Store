package com.buyandsellstore.app.repository;

import com.buyandsellstore.app.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);

    boolean existsByUsername(String username);

    // Added for email lookup
    User findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}

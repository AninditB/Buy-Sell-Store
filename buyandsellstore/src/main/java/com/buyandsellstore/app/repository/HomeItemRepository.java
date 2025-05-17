package com.buyandsellstore.app.repository;

import com.buyandsellstore.app.model.HomeItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeItemRepository extends MongoRepository<HomeItem, String> {

    HomeItem findByType(String type);
    HomeItem findByManufacturer(String manufacturer);

    HomeItem findByTitleAndSellerId(String title, String sellerId);

    List<HomeItem> findBySellerId(String sellerId);
}

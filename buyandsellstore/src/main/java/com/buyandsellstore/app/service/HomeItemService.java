package com.buyandsellstore.app.service;

import com.buyandsellstore.app.model.HomeItem;
import com.buyandsellstore.app.model.Review;
import com.buyandsellstore.app.repository.HomeItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class HomeItemService {

    @Autowired
    private HomeItemRepository homeItemRepository;

    public List<HomeItem> getAllHomeItems() {
        return homeItemRepository.findAll();
    }

    public HomeItem getHomeItemById(String id) {
        return homeItemRepository.findById(id).orElse(null);
    }
    
    public HomeItem getHomeItemByType(String type) {
        return homeItemRepository.findByType(type);
    }

    public List<HomeItem> findBySellerId(String sellerId) {
        return homeItemRepository.findBySellerId(sellerId);
    }

    public HomeItem findByTitleAndSellerId(String title, String sellerId) {
        return homeItemRepository.findByTitleAndSellerId(title, sellerId);
    }
    
    public HomeItem findByManufacturer(String manufacturer) {
        return homeItemRepository.findByManufacturer(manufacturer);
    }

    public HomeItem save(HomeItem homeItem) {
        return homeItemRepository.save(homeItem);
    }
    
    // New methods for review management
    
    // Add a review to a home item
    public HomeItem addReview(String homeItemId, Review newReview) {
        HomeItem homeItem = homeItemRepository.findById(homeItemId).orElse(null);
        if (homeItem != null) {
            List<Review> reviews = homeItem.getReviews();
            if (reviews == null) reviews = new ArrayList<>();
            reviews.add(newReview);
            homeItem.setReviews(reviews);
            
            // Update ratings average
            double totalRating = 0;
            for (Review review : reviews) {
                totalRating += review.getRating();
            }
            double averageRating = totalRating / reviews.size();
            homeItem.setRatings(averageRating);
            
            homeItemRepository.save(homeItem);
        }
        return homeItem;
    }

    // Update a review by reviewer name
    public HomeItem updateReview(String homeItemId, String reviewer, Review updatedReview) {
        HomeItem homeItem = homeItemRepository.findById(homeItemId).orElse(null);
        if (homeItem != null && homeItem.getReviews() != null) {
            for (Review review : homeItem.getReviews()) {
                if (review.getReviewer().equalsIgnoreCase(reviewer)) {
                    review.setComment(updatedReview.getComment());
                    review.setRating(updatedReview.getRating());
                    break;
                }
            }
            
            // Update ratings average
            List<Review> reviews = homeItem.getReviews();
            double totalRating = 0;
            for (Review review : reviews) {
                totalRating += review.getRating();
            }
            double averageRating = totalRating / reviews.size();
            homeItem.setRatings(averageRating);
            
            homeItemRepository.save(homeItem);
        }
        return homeItem;
    }

    // Delete a review by reviewer name
    public HomeItem deleteReview(String homeItemId, String reviewer) {
        HomeItem homeItem = homeItemRepository.findById(homeItemId).orElse(null);
        if (homeItem != null && homeItem.getReviews() != null) {
            homeItem.getReviews().removeIf(review -> review.getReviewer().equalsIgnoreCase(reviewer));
            
            // Update ratings average if there are still reviews
            List<Review> reviews = homeItem.getReviews();
            if (!reviews.isEmpty()) {
                double totalRating = 0;
                for (Review review : reviews) {
                    totalRating += review.getRating();
                }
                double averageRating = totalRating / reviews.size();
                homeItem.setRatings(averageRating);
            } else {
                // If no reviews are left, reset ratings to 0
                homeItem.setRatings(0.0);
            }
            
            homeItemRepository.save(homeItem);
        }
        return homeItem;
    }
}
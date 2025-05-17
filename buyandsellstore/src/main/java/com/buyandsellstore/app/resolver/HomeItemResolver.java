package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.UploadHomeItemResponse;
import com.buyandsellstore.app.model.HomeItem;
import com.buyandsellstore.app.model.Review;
import com.buyandsellstore.app.service.HomeItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

@Controller
public class HomeItemResolver {

    @Autowired
    private HomeItemService homeItemService;

    @MutationMapping
    public UploadHomeItemResponse uploadHomeItem(
            @Argument String title,
            @Argument String description,
            @Argument int totalQuantity,
            @Argument double price,
            @Argument String imageUrl,
            @Argument String manufacturer,
            @Argument String sellerId,
            @Argument String type) {

        // Check for existing item by title and seller
        HomeItem existingItem = homeItemService.findByTitleAndSellerId(title, sellerId);
        if (existingItem != null) {
            return new UploadHomeItemResponse(false, "Seller has already uploaded an item. Duplicate uploads are not allowed.", null);
        }

        // Optionally prevent duplicates by manufacturer
        HomeItem byManufacturer = homeItemService.findByManufacturer(manufacturer);
        if (byManufacturer != null && byManufacturer.getSellerId().equals(sellerId)) {
            return new UploadHomeItemResponse(false, "Duplicate item by the same manufacturer and seller is not allowed.", null);
        }

        HomeItem homeItem = new HomeItem(title, type, description, price, imageUrl, manufacturer, sellerId, totalQuantity);
        homeItem.setReviews(new ArrayList<>());
        return new UploadHomeItemResponse(true, "Upload successful", homeItemService.save(homeItem));
    }

    @MutationMapping
    public UploadHomeItemResponse updateHomeItem(
            @Argument String id,
            @Argument String title,
            @Argument String description,
            @Argument int totalQuantity,
            @Argument double price,
            @Argument String imageUrl,
            @Argument String manufacturer,
            @Argument String sellerId,
            @Argument String type) {

        // Find existing item by ID
        HomeItem existingItem = homeItemService.getHomeItemById(id);
        if (existingItem == null) {
            return new UploadHomeItemResponse(false, "Home item not found.", null);
        }

        // Update fields
        existingItem.setTitle(title);
        existingItem.setDescription(description);
        existingItem.setTotalQuantity(totalQuantity);
        existingItem.setPrice(price);
        existingItem.setImageUrl(imageUrl);
        existingItem.setManufacturer(manufacturer);
        existingItem.setSellerId(sellerId);
        existingItem.setType(type);

        HomeItem updatedItem = homeItemService.save(existingItem);
        return new UploadHomeItemResponse(true, "Home item updated successfully.", updatedItem);
    }

    @QueryMapping
    public List<HomeItem> homeItems() {
        return homeItemService.getAllHomeItems();
    }

    @QueryMapping
    public HomeItem homeItem(@Argument String id) {
        return homeItemService.getHomeItemById(id);
    }

    @QueryMapping
    public List<HomeItem> getHomeItemsBySellerId(@Argument String sellerId) {
        return homeItemService.findBySellerId(sellerId);
    }

    // ===== Review Mutations for HomeItem =====

    @MutationMapping
    public HomeItem addHomeItemReview(
            @Argument String homeItemId,
            @Argument Review review) {
        return homeItemService.addReview(homeItemId, review);
    }

    @MutationMapping
    public HomeItem updateHomeItemReview(
            @Argument String homeItemId,
            @Argument String reviewer,
            @Argument Review updatedReview) {
        return homeItemService.updateReview(homeItemId, reviewer, updatedReview);
    }

    @MutationMapping
    public HomeItem deleteHomeItemReview(
            @Argument String homeItemId,
            @Argument String reviewer) {
        return homeItemService.deleteReview(homeItemId, reviewer);
    }
}

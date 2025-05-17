package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.model.ResponseMessage;
import com.buyandsellstore.app.model.WishlistItem;
import com.buyandsellstore.app.model.WishlistItemInput; // Updated import from model package
import com.buyandsellstore.app.service.WishlistItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
public class WishlistItemResolver {

    private final WishlistItemService wishlistItemService;

    @Autowired
    public WishlistItemResolver(WishlistItemService wishlistItemService) {
        this.wishlistItemService = wishlistItemService;
    }

    // Query: Get all wishlist items for a given user
    @QueryMapping
    public List<WishlistItem> wishlistItems(@Argument String userId) {
        return wishlistItemService.getWishlistItemsByUserId(userId);
    }

    // Query: Get a single wishlist item by its ID
    @QueryMapping
    public WishlistItem wishlistItem(@Argument String id) {
        Optional<WishlistItem> wishlistItemOpt = wishlistItemService.getWishlistItemById(id);
        return wishlistItemOpt.orElse(null);
    }

    // Mutation: Add a new wishlist item
    @MutationMapping
    public WishlistItem addWishlistItem(@Argument WishlistItemInput input) {
        WishlistItem wishlistItem = new WishlistItem();
        wishlistItem.setUserId(input.getUserId());
        wishlistItem.setItemId(input.getItemId());
        wishlistItem.setType(input.getType());
        wishlistItem.setName(input.getName());
        wishlistItem.setImageUrl(input.getImageUrl());
        return wishlistItemService.addWishlistItem(wishlistItem);
    }

    // Mutation: Update an existing wishlist item
    @MutationMapping
    public WishlistItem updateWishlistItem(@Argument WishlistItemInput input) {
        WishlistItem wishlistItem = new WishlistItem();
        // Assume the input includes an id for the item to update
        wishlistItem.setId(input.getId());
        wishlistItem.setUserId(input.getUserId());
        wishlistItem.setItemId(input.getItemId());
        wishlistItem.setType(input.getType());
        wishlistItem.setName(input.getName());
        wishlistItem.setImageUrl(input.getImageUrl());
        return wishlistItemService.updateWishlistItem(wishlistItem);
    }

    // Mutation: Remove a wishlist item by its ID
    @MutationMapping
    public ResponseMessage removeWishlistItem(@Argument String id) {
        wishlistItemService.removeWishlistItem(id);
        return new ResponseMessage(true, "Wishlist item removed successfully");
    }
}

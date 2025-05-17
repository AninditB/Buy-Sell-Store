package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.ResponseMessage;
import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.model.CartItem;
import com.buyandsellstore.app.model.HomeItem;
import com.buyandsellstore.app.service.BookService;
import com.buyandsellstore.app.service.CartService;
import com.buyandsellstore.app.service.HomeItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

@Controller
public class CartResolver {
    @Autowired
    private CartService cartService;
    @Autowired
    private BookService bookService;

    @Autowired
    private HomeItemService homeItemService;

    @QueryMapping(name = "cartItems")
    public List<CartItem> getCartItems(@Argument(name = "id") String userId) {
        // Retrieve cart items for the user

        List<CartItem> cartItems = cartService.getAllCartItemsForUser(userId);
        //System.out.println("getCartItems query called with: " + userId);
        // Ensure an empty list is returned if the user has no cart items
        return cartItems != null ? cartItems : new ArrayList<>();
    }
    @MutationMapping
    public ResponseMessage addToCart(
            @Argument String userId,
            @Argument String itemId,
            @Argument String type
    ) {
        //System.out.println("addToCart mutation called with: " + userId + ", " + itemId + ", " + type);
        if (type == null || type.isEmpty()) {
            return new ResponseMessage(false, "Item type is required.");
        }
        switch (type.toLowerCase()) {
            case "book":
                Book book = bookService.getBookById(itemId);
                if (book == null) {
                    return new ResponseMessage(false, "Book not found.");
                }
                if (book.getTotalQuantity() <= 0) {
                    return new ResponseMessage(false, "Item not available anymore!");
                }
                cartService.addToCart(userId, itemId, type);
                book.setTotalQuantity(book.getTotalQuantity() - 1);
                bookService.save(book);
                return new ResponseMessage(true, "Book added to the cart!");
            case "home":
                HomeItem homeItem = homeItemService.getHomeItemById(itemId);
                if (homeItem == null) {
                    return new ResponseMessage(false, "Home item not found.");
                }
                if (homeItem.getTotalQuantity() <= 0) {
                    return new ResponseMessage(false, "Item not available anymore!");
                }
                cartService.addToCart(userId, itemId, type);
                homeItem.setTotalQuantity(homeItem.getTotalQuantity() - 1);
                homeItemService.save(homeItem);
                return new ResponseMessage(true, "Home item added to the cart!");
            default:
                return new ResponseMessage(false, "Unsupported item type: " + type);
        }
    }

//    @MutationMapping
//    public ResponseMessage removeFromCart(
//            @Argument String userId,
//            @Argument String itemId,
//            @Argument String type
//    ) {
//        //System.out.println("removeFromCart mutation called with: " + userId + ", " + itemId + ", " + type);
//        return cartService.removeFromCart(userId, itemId, type);
//    }

    @MutationMapping
    public ResponseMessage removeFromCart(
            @Argument String userId,
            @Argument String itemId,
            @Argument String type
    ) {
        if (type == null || type.isEmpty()) {
            return new ResponseMessage(false, "Item type is required.");
        }

        ResponseMessage message = cartService.removeFromCart(userId, itemId, type);
        if (!message.isSuccess()) {
            return new ResponseMessage(false, "Failed to remove item from cart.");
        }

        switch (type.toLowerCase()) {
            case "book":
                Book book = bookService.getBookById(itemId);
                if (book != null) {
                    book.setTotalQuantity(book.getTotalQuantity() + 1);
                    bookService.save(book);
                }
                return new ResponseMessage(true, "Book removed from cart!.");

            case "home":
                HomeItem homeItem = homeItemService.getHomeItemById(itemId);
                if (homeItem != null) {
                    homeItem.setTotalQuantity(homeItem.getTotalQuantity() + 1);
                    homeItemService.save(homeItem);
                }
                return new ResponseMessage(true, "Home item removed from cart!");

            default:
                return new ResponseMessage(false, "Unsupported item type: " + type);
        }
    }

}

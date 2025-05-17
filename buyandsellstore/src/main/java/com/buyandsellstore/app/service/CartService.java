package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.ResponseMessage;
import com.buyandsellstore.app.model.Cart;
import com.buyandsellstore.app.model.CartItem;
import com.buyandsellstore.app.repository.BookRepository;
import com.buyandsellstore.app.repository.CartRepository;
import com.buyandsellstore.app.repository.HomeItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private BookRepository bookRepository; // For fetching book details if the type is 'book'

    @Autowired
    private HomeItemRepository homeItemRepository; // For fetching book details if the type is 'book'

    public ResponseMessage addToCart(String userId, String itemId, String type) {
        // Fetch the existing cart for the user
        Optional<Cart> optionalCart = cartRepository.findByUserId(userId);

        Cart cart;
        if (optionalCart.isPresent()) {
            cart = optionalCart.get();
        } else {
            // Create a new cart if it doesn't exist
            cart = new Cart();
            cart.setUserId(userId);
        }

        // Check if the item already exists in the cart
        boolean itemExists = cart.getItems().stream()
                .anyMatch(cartItem -> cartItem.getItemId().equals(itemId) && cartItem.getType().equalsIgnoreCase(type));

        if (itemExists) {
            // Update the quantity of the existing item
            cart.getItems().forEach(cartItem -> {
                if (cartItem.getItemId().equals(itemId) && cartItem.getType().equalsIgnoreCase(type)) {
                    cartItem.setQuantity(cartItem.getQuantity() + 1); // Increment quantity
                }
            });
        } else {
            // Create a new CartItem
            CartItem cartItem = new CartItem();
            cartItem.setItemId(itemId);
            cartItem.setType(type);

            if ("book".equalsIgnoreCase(type)) {
                // Fetch book details
                bookRepository.findById(itemId).ifPresent(book -> {
                    cartItem.setName(book.getTitle());
                    cartItem.setPrice(book.getPrice());
                    cartItem.setQuantity(1); // Default to 1
                    cartItem.setImageUrl(book.getImageUrl()); // Default to 1
                });
            } else if ("home".equalsIgnoreCase(type)) {
                homeItemRepository.findById(itemId).ifPresent(homeItem -> {
                    cartItem.setName(homeItem.getTitle());
                    cartItem.setPrice(homeItem.getPrice());
                    cartItem.setQuantity(1); // Default to 1
                    cartItem.setImageUrl(homeItem.getImageUrl()); // Default to 1
                });
            }else {
                // For other types, add custom logic here
                cartItem.setName("Unknown Item");
                cartItem.setPrice(0.0);
                cartItem.setQuantity(1);
            }

            // Add the new item to the cart
            cart.getItems().add(cartItem);
        }

        // Save the updated cart
        cartRepository.save(cart);

        return new ResponseMessage(true, "Item added to cart successfully.");
    }


    public List<CartItem> getAllCartItemsForUser(String userId) {
        // Check if the cart for the user exists
        Optional<Cart> cart = cartRepository.findByUserId(userId);
        return cart.map(Cart::getItems).orElse(new ArrayList<>());
    }

    public ResponseMessage removeFromCart(String userId, String itemId, String type) {

        Optional<Cart> optionalCart = cartRepository.findByUserId(userId);

        if (optionalCart.isEmpty()) {
            return new ResponseMessage(false, "Cart not found for the user.");
        }

        Cart cart = optionalCart.get();

        // this is because we call this type of remove query from frontend only when we want to delete the entire cart
        if (itemId == null && type == null) {
            cartRepository.delete(cart);
            return new ResponseMessage(true, "Entire cart deleted successfully.");
        }

        boolean itemFound = false;

        // Iterate through items to find the matching one
        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getItemId().equals(itemId) && cartItem.getType().equalsIgnoreCase(type)) {
                itemFound = true;

                // Reduce quantity by 1
                cartItem.setQuantity(cartItem.getQuantity() - 1);

                // If quantity becomes zero, remove the item
                if (cartItem.getQuantity() <= 0) {
                    cart.getItems().remove(cartItem);
                }
                break;
            }
        }

        if (!itemFound) {
            return new ResponseMessage(false, "Item not found in the cart.");
        }

        // If the cart becomes empty after removal, delete the cart
        if (cart.getItems().isEmpty()) {
            cartRepository.delete(cart);
            return new ResponseMessage(true, "Cart deleted as it became empty.");
        }

        // Save the updated cart
        cartRepository.save(cart);
        return new ResponseMessage(true, "Item quantity reduced successfully.");
    }
}

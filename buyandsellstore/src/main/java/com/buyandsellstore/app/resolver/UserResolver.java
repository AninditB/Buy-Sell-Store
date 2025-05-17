package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.AuthResponse;
import com.buyandsellstore.app.model.Address;
import com.buyandsellstore.app.model.AddressInput;
import com.buyandsellstore.app.model.User;
import com.buyandsellstore.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.Optional;

@Controller
public class UserResolver {

    @Autowired
    private UserService userService;

    @QueryMapping
    public String hello() {
        return "Hello Chitra";
    }

    @MutationMapping
    public AuthResponse login(@Argument String username, @Argument String password) {
        // Validate input arguments
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return new AuthResponse(false, "Username or password cannot be empty.", null);
        }
        try {
            // Authenticate the user
            User user = userService.authenticate(username, password);
            if (user == null) {
                return new AuthResponse(false, "Invalid credentials.", null);
            }
            // Successful login
            return new AuthResponse(true, "Login successful!", user);
        } catch (Exception e) {
            e.printStackTrace();
            return new AuthResponse(false, "An error occurred during login. Please try again.", null);
        }
    }

    @MutationMapping
    public AuthResponse signup(@Argument String username,
            @Argument String email,
            @Argument String password,
            @Argument String firstName,
            @Argument String lastName,
            @Argument String phone,
            @Argument boolean isSeller,
            @Argument List<Address> billing,
            @Argument List<Address> shipping) {
        // Note: For signup, you might eventually want to map incoming address inputs.
        // For now, a new user is created with the provided info.
        return userService.createUser(new User(username, email, password, firstName, lastName, phone, isSeller));
    }

    @MutationMapping
    public User updateUser(
            @Argument String id,
            @Argument String phone,
            @Argument String profilePictureUrl,
            @Argument List<AddressInput> billing,
            @Argument List<AddressInput> shipping,
            @Argument Integer primaryBillingIndex,
            @Argument Integer primaryShippingIndex) {

        // Load existing user
        User existing = userService.findById(id);

        // 1) Scalar updates
        if (phone != null)
            existing.setPhone(phone);
        if (profilePictureUrl != null)
            existing.setProfilePictureUrl(profilePictureUrl);

        // 2) Only overwrite billing if billing was provided
        if (billing != null) {
            List<Address> billingAddresses = billing.stream()
                    .map(input -> new Address(
                            input.getType(),
                            input.getStreet(),
                            input.getCity(),
                            input.getState(),
                            input.getZip(),
                            input.getCountry()))
                    .collect(Collectors.toList());
            existing.setBilling(billingAddresses);
        }

        // 3) Only overwrite shipping if shipping was provided
        if (shipping != null) {
            List<Address> shippingAddresses = shipping.stream()
                    .map(input -> new Address(
                            input.getType(),
                            input.getStreet(),
                            input.getCity(),
                            input.getState(),
                            input.getZip(),
                            input.getCountry()))
                    .collect(Collectors.toList());
            existing.setShipping(shippingAddresses);
        }

        // 4) Primary‐index updates
        if (primaryBillingIndex != null)
            existing.setPrimaryBillingIndex(primaryBillingIndex);
        if (primaryShippingIndex != null)
            existing.setPrimaryShippingIndex(primaryShippingIndex);

        // 5) Persist & return
        return userService.save(existing);
    }

}

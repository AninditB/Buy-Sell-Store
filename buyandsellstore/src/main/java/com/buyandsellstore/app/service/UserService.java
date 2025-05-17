package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.AuthResponse;
import com.buyandsellstore.app.model.User;
import com.buyandsellstore.app.repository.UserRepository;
import java.util.Optional;
import com.buyandsellstore.app.model.Address;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Autowire the PasswordEncoder bean defined in SecurityConfig
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User existByUserName(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Find a user by ID or throw if not found.
     */
    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + id));
    }

    /**
     * Save (insert or update) a user.
     */
    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Authenticates a user by comparing the raw password with the stored hashed
     * password.
     *
     * @param username    the username of the user
     * @param rawPassword the password provided by the user at login
     * @return the User if authentication succeeds, or null if it fails
     */
    public User authenticate(String username, String rawPassword) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return null;
        }
        // Use BCrypt to verify the password
        return passwordEncoder.matches(rawPassword, user.getPassword()) ? user : null;
    }

    /**
     * Creates a new user, ensuring the password is hashed before saving.
     *
     * @param user the user to be created
     * @return an AuthResponse indicating success or failure, plus the saved user if
     *         successful
     */
    public AuthResponse createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return new AuthResponse(false, "Username already exists!", null);
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return new AuthResponse(false, "Email already exists!", null);
        }
        if (userRepository.existsByPhone(user.getPhone())) {
            return new AuthResponse(false, "Phone number already exists!", null);
        }

        // Hash the raw password before saving
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        User savedUser = userRepository.save(user);
        return new AuthResponse(true, "User successfully added to DB!", savedUser);
    }

    // public User updateUser(String id,
    // String phone,
    // String profilePictureUrl,
    // List<Address> billing,
    // List<Address> shipping,
    // Integer primaryBillingIndex,
    // Integer primaryShippingIndex) {

    // Optional<User> userOpt = userRepository.findById(id);
    // if (userOpt.isEmpty()) {
    // throw new RuntimeException("User not found");
    // }

    // User user = userOpt.get();

    // if (phone != null) {
    // user.setPhone(phone);
    // }
    // if (profilePictureUrl != null) {
    // user.setProfilePictureUrl(profilePictureUrl);
    // }
    // if (billing != null) {
    // user.setBilling(billing);
    // }
    // if (shipping != null) {
    // user.setShipping(shipping);
    // }
    // if (primaryBillingIndex != null) {
    // user.setPrimaryBillingIndex(primaryBillingIndex);
    // }
    // if (primaryShippingIndex != null) {
    // user.setPrimaryShippingIndex(primaryShippingIndex);
    // }

    // return userRepository.save(user);
    // }

    /**
     * Bulk‐update fields on a user, but only overwrite billing/shipping
     * if those arguments are non‐null.
     */
    @Transactional
    public User updateUser(
            String id,
            String phone,
            String profilePictureUrl,
            List<Address> billing,
            List<Address> shipping,
            Integer primaryBillingIndex,
            Integer primaryShippingIndex) {

        // 1) Fetch or 404
        User user = findById(id);

        // 2) Scalar fields
        if (phone != null)
            user.setPhone(phone);
        if (profilePictureUrl != null)
            user.setProfilePictureUrl(profilePictureUrl);

        // 3) Billing list (only if provided)
        if (billing != null) {
            user.getBilling().clear();
            user.getBilling().addAll(billing);
        }

        // 4) Shipping list (only if provided)
        if (shipping != null) {
            user.getShipping().clear();
            user.getShipping().addAll(shipping);
        }

        // 5) Primary‐index fields
        if (primaryBillingIndex != null)
            user.setPrimaryBillingIndex(primaryBillingIndex);
        if (primaryShippingIndex != null)
            user.setPrimaryShippingIndex(primaryShippingIndex);

        // 6) Persist & return
        return userRepository.save(user);
    }

}

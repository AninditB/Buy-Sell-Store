package com.buyandsellstore.app.service;

import com.buyandsellstore.app.model.HomeItem;
import com.buyandsellstore.app.model.Review;
import com.buyandsellstore.app.repository.HomeItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HomeItemServiceTest {
    @Mock
    private HomeItemRepository homeItemRepository;

    @InjectMocks
    private HomeItemService homeItemService;

    private HomeItem homeItem;

    @BeforeEach
    public void setUp() {
        homeItem = new HomeItem();
        homeItem.setId("1");
        homeItem.setTitle("Vacuum Cleaner");
        homeItem.setSellerId("seller1");
        homeItem.setManufacturer("Philips");
        homeItem.setType("Appliance");
        homeItem.setRatings(0.0);
        homeItem.setReviews(new ArrayList<>());
    }

    @Test
    public void testGetAllHomeItems() {
        when(homeItemRepository.findAll()).thenReturn(List.of(homeItem));
        List<HomeItem> result = homeItemService.getAllHomeItems();
        assertEquals(1, result.size());
        verify(homeItemRepository, times(1)).findAll();
    }

    @Test
    public void testGetHomeItemById() {
        when(homeItemRepository.findById("1")).thenReturn(Optional.of(homeItem));
        HomeItem result = homeItemService.getHomeItemById("1");
        assertNotNull(result);
        assertEquals("1", result.getId());
    }

    @Test
    public void testGetHomeItemByType() {
        when(homeItemRepository.findByType("Appliance")).thenReturn(homeItem);
        HomeItem result = homeItemService.getHomeItemByType("Appliance");
        assertNotNull(result);
        assertEquals("Appliance", result.getType());
    }

    @Test
    public void testFindBySellerId() {
        when(homeItemRepository.findBySellerId("seller1")).thenReturn(List.of(homeItem));
        List<HomeItem> result = homeItemService.findBySellerId("seller1");
        assertEquals(1, result.size());
    }

    @Test
    public void testFindByTitleAndSellerId() {
        when(homeItemRepository.findByTitleAndSellerId("Vacuum Cleaner", "seller1")).thenReturn(homeItem);
        HomeItem result = homeItemService.findByTitleAndSellerId("Vacuum Cleaner", "seller1");
        assertNotNull(result);
        assertEquals("Vacuum Cleaner", result.getTitle());
    }

    @Test
    public void testFindByManufacturer() {
        when(homeItemRepository.findByManufacturer("Philips")).thenReturn(homeItem);
        HomeItem result = homeItemService.findByManufacturer("Philips");
        assertEquals("Philips", result.getManufacturer());
    }

    @Test
    public void testSaveHomeItem() {
        when(homeItemRepository.save(homeItem)).thenReturn(homeItem);
        HomeItem result = homeItemService.save(homeItem);
        assertEquals("1", result.getId());
    }

    @Test
    public void testAddReview() {
        Review review = new Review("test", "test", 5);
        when(homeItemRepository.findById("1")).thenReturn(Optional.of(homeItem));
        when(homeItemRepository.save(any(HomeItem.class))).thenAnswer(inv -> inv.getArgument(0));

        HomeItem result = homeItemService.addReview("1", review);
        assertNotNull(result);
        assertEquals(1, result.getReviews().size());
        assertEquals(5.0, result.getRatings());
    }

    @Test
    public void testUpdateReview() {
        Review originalReview = new Review("user1", "Okay", 3.0);
        Review updatedReview = new Review("user1", "Much better", 4.5);
        homeItem.setReviews(new ArrayList<>(List.of(originalReview)));

        when(homeItemRepository.findById("1")).thenReturn(Optional.of(homeItem));
        when(homeItemRepository.save(any(HomeItem.class))).thenAnswer(inv -> inv.getArgument(0));

        HomeItem result = homeItemService.updateReview("1", "user1", updatedReview);
        assertEquals("Much better", result.getReviews().get(0).getComment());
        assertEquals(4.5, result.getRatings());
    }

    @Test
    public void testDeleteReview() {
        Review review = new Review("user1", "Nice", 4.0);
        homeItem.setReviews(new ArrayList<>(List.of(review)));

        when(homeItemRepository.findById("1")).thenReturn(Optional.of(homeItem));
        when(homeItemRepository.save(any(HomeItem.class))).thenAnswer(inv -> inv.getArgument(0));

        HomeItem result = homeItemService.deleteReview("1", "user1");
        assertEquals(0, result.getReviews().size());
        assertEquals(0.0, result.getRatings());
    }
}

package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserResolver userResolver;

    public ReviewController(ReviewService reviewService, UserResolver userResolver) {
        this.reviewService = reviewService; this.userResolver = userResolver;
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(@AuthenticationPrincipal UserDetails u,
            @PathVariable Long productId, @RequestBody ReviewRequest r) {
        return ResponseEntity.ok(reviewService.addReview(userResolver.resolveId(u), productId, r));
    }
}

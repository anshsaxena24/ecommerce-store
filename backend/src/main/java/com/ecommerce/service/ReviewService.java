package com.ecommerce.service;

import com.ecommerce.dto.*;
import com.ecommerce.exception.*;
import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<ReviewResponse> getProductReviews(Long productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ReviewResponse addReview(Long userId, Long productId, ReviewRequest request) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        if (reviewRepository.existsByUserIdAndProductId(userId, productId))
            throw new IllegalArgumentException("You have already reviewed this product");
        if (request.getRating() < 1 || request.getRating() > 5)
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId).get();
        Review review = Review.builder().user(user).product(product)
                .rating(request.getRating()).comment(request.getComment()).build();
        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse toResponse(Review review) {
        ReviewResponse r = new ReviewResponse();
        r.setId(review.getId());
        r.setUserId(review.getUser().getId());
        r.setUserName(review.getUser().getFirstName() + " " + review.getUser().getLastName());
        r.setProductId(review.getProduct().getId());
        r.setRating(review.getRating());
        r.setComment(review.getComment());
        r.setCreatedAt(review.getCreatedAt());
        return r;
    }
}

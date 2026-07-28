package com.ecommerce.service;

import com.ecommerce.dto.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
                          ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
    }

    public Page<ProductResponse> getProducts(int page, int size, String sort,
                                              Long categoryId, BigDecimal minPrice,
                                              BigDecimal maxPrice, Boolean inStock) {
        Sort sortObj = switch (sort != null ? sort : "newest") {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            default           -> Sort.by("createdAt").descending();
        };
        Pageable pageable = PageRequest.of(page, size, sortObj);
        return productRepository.findAllWithFilters(categoryId, minPrice, maxPrice, inStock, pageable)
                .map(this::toResponse);
    }

    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        if (!product.getIsActive()) throw new ResourceNotFoundException("Product not found: " + id);
        return toResponse(product);
    }

    public Page<ProductResponse> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.searchByNameOrDescription(query, pageable).map(this::toResponse);
    }

    public Page<ProductResponse> getByCategory(String slug, int page, int size) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug));
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByCategoryId(category.getId(), pageable).map(this::toResponse);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Product product = Product.builder()
                .name(request.getName()).description(request.getDescription())
                .price(request.getPrice()).stockQuantity(request.getStockQuantity())
                .category(category).isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage img = new ProductImage();
                img.setProduct(product); img.setImageUrl(request.getImageUrls().get(i));
                img.setIsPrimary(i == 0); img.setDisplayOrder(i);
                images.add(img);
            }
            product.setImages(images);
        }
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }
        if (request.getImageUrls() != null) {
            List<ProductImage> images = product.getImages() != null ? product.getImages() : new ArrayList<>();
            images.clear();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage img = new ProductImage();
                img.setProduct(product); img.setImageUrl(request.getImageUrls().get(i));
                img.setIsPrimary(i == 0); img.setDisplayOrder(i);
                images.add(img);
            }
            product.setImages(images);
        }
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void softDelete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    public ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStockQuantity(product.getStockQuantity());
        response.setIsActive(product.getIsActive());
        response.setCreatedAt(product.getCreatedAt());
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            response.setImageUrls(product.getImages().stream()
                    .sorted((a, b) -> Integer.compare(
                            a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                            b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                    .map(ProductImage::getImageUrl).collect(Collectors.toList()));
            product.getImages().stream().filter(img -> Boolean.TRUE.equals(img.getIsPrimary())).findFirst()
                    .ifPresent(img -> response.setPrimaryImageUrl(img.getImageUrl()));
            if (response.getPrimaryImageUrl() == null)
                response.setPrimaryImageUrl(product.getImages().get(0).getImageUrl());
        }
        reviewRepository.findAverageRatingByProductId(product.getId()).ifPresent(response::setAverageRating);
        response.setReviewCount(product.getReviews() != null ? product.getReviews().size() : 0);
        return response;
    }
}

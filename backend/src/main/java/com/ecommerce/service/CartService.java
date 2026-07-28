package com.ecommerce.service;

import com.ecommerce.dto.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public CartResponse getCart(Long userId) {
        return buildCartResponse(cartItemRepository.findByUserIdWithProductDetails(userId));
    }

    @Transactional
    public CartResponse addItem(Long userId, CartItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));
        if (!product.getIsActive()) throw new ResourceNotFoundException("Product is not available");

        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId());
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            CartItem newItem = CartItem.builder().user(user).product(product).quantity(request.getQuantity()).build();
            cartItemRepository.save(newItem);
        }
        return getCart(userId);
    }

    @Transactional
    public CartResponse updateItem(Long userId, Long cartItemId, CartItemRequest request) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));
        if (!item.getUser().getId().equals(userId)) throw new ResourceNotFoundException("Cart item not found");
        if (request.getQuantity() <= 0) cartItemRepository.delete(item);
        else { item.setQuantity(request.getQuantity()); cartItemRepository.save(item); }
        return getCart(userId);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));
        if (!item.getUser().getId().equals(userId)) throw new ResourceNotFoundException("Cart item not found");
        cartItemRepository.delete(item);
        return getCart(userId);
    }

    @Transactional
    public void clearCart(Long userId) { cartItemRepository.deleteByUserId(userId); }

    private CartResponse buildCartResponse(List<CartItem> items) {
        List<CartResponse.CartItemResponse> itemResponses = items.stream().map(item -> {
            CartResponse.CartItemResponse r = new CartResponse.CartItemResponse();
            r.setCartItemId(item.getId());
            r.setProductId(item.getProduct().getId());
            r.setProductName(item.getProduct().getName());
            r.setPrice(item.getProduct().getPrice());
            r.setQuantity(item.getQuantity());
            r.setStockQuantity(item.getProduct().getStockQuantity());
            r.setItemTotal(item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            if (item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
                item.getProduct().getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary())).findFirst()
                    .ifPresentOrElse(
                        img -> r.setPrimaryImageUrl(img.getImageUrl()),
                        () -> r.setPrimaryImageUrl(item.getProduct().getImages().get(0).getImageUrl()));
            }
            return r;
        }).collect(Collectors.toList());

        CartResponse response = new CartResponse();
        response.setItems(itemResponses);
        response.setTotalItems(itemResponses.stream().mapToInt(CartResponse.CartItemResponse::getQuantity).sum());
        response.setSubtotal(itemResponses.stream()
                .map(CartResponse.CartItemResponse::getItemTotal).reduce(BigDecimal.ZERO, BigDecimal::add));
        return response;
    }
}

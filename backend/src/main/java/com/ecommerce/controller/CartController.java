package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserResolver userResolver;

    public CartController(CartService cartService, UserResolver userResolver) {
        this.cartService = cartService; this.userResolver = userResolver;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(cartService.getCart(userResolver.resolveId(u)));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal UserDetails u, @RequestBody CartItemRequest r) {
        return ResponseEntity.ok(cartService.addItem(userResolver.resolveId(u), r));
    }

    @PatchMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateItem(@AuthenticationPrincipal UserDetails u,
            @PathVariable Long cartItemId, @RequestBody CartItemRequest r) {
        return ResponseEntity.ok(cartService.updateItem(userResolver.resolveId(u), cartItemId, r));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(@AuthenticationPrincipal UserDetails u, @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(userResolver.resolveId(u), cartItemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails u) {
        cartService.clearCart(userResolver.resolveId(u)); return ResponseEntity.noContent().build();
    }
}

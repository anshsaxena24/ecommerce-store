package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.service.AddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;
    private final UserResolver userResolver;

    public AddressController(AddressService addressService, UserResolver userResolver) {
        this.addressService = addressService; this.userResolver = userResolver;
    }

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAddresses(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(addressService.getUserAddresses(userResolver.resolveId(u)));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(@AuthenticationPrincipal UserDetails u, @RequestBody AddressRequest r) {
        return ResponseEntity.ok(addressService.addAddress(userResolver.resolveId(u), r));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(@AuthenticationPrincipal UserDetails u,
            @PathVariable Long id, @RequestBody AddressRequest r) {
        return ResponseEntity.ok(addressService.updateAddress(userResolver.resolveId(u), id, r));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@AuthenticationPrincipal UserDetails u, @PathVariable Long id) {
        addressService.deleteAddress(userResolver.resolveId(u), id); return ResponseEntity.noContent().build();
    }
}

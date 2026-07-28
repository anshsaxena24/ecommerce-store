package com.ecommerce.service;

import com.ecommerce.dto.*;
import com.ecommerce.exception.*;
import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.clearDefaultForUser(userId);
        }
        Address address = Address.builder()
                .user(user).fullName(request.getFullName()).street(request.getStreet())
                .city(request.getCity()).state(request.getState())
                .postalCode(request.getPostalCode()).country(request.getCountry())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .build();
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));
        if (!address.getUser().getId().equals(userId)) throw new UnauthorizedException("Access denied");
        if (Boolean.TRUE.equals(request.getIsDefault())) addressRepository.clearDefaultForUser(userId);
        address.setFullName(request.getFullName());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));
        if (!address.getUser().getId().equals(userId)) throw new UnauthorizedException("Access denied");
        addressRepository.delete(address);
    }

    public AddressResponse toResponse(Address address) {
        AddressResponse r = new AddressResponse();
        r.setId(address.getId());
        r.setFullName(address.getFullName());
        r.setStreet(address.getStreet());
        r.setCity(address.getCity());
        r.setState(address.getState());
        r.setPostalCode(address.getPostalCode());
        r.setCountry(address.getCountry());
        r.setIsDefault(address.getIsDefault());
        return r;
    }
}

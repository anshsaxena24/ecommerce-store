package com.ecommerce.model;

import jakarta.persistence.*;

@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(name = "postal_code", nullable = false)
    private String postalCode;

    @Column(nullable = false)
    private String country;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    public Address() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Address a = new Address();
        public Builder user(User v) { a.user = v; return this; }
        public Builder fullName(String v) { a.fullName = v; return this; }
        public Builder street(String v) { a.street = v; return this; }
        public Builder city(String v) { a.city = v; return this; }
        public Builder state(String v) { a.state = v; return this; }
        public Builder postalCode(String v) { a.postalCode = v; return this; }
        public Builder country(String v) { a.country = v; return this; }
        public Builder isDefault(Boolean v) { a.isDefault = v; return this; }
        public Address build() { return a; }
    }
}

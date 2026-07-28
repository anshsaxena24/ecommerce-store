package com.ecommerce.dto;
public class AuthResponse {
    private String token;
    private String role;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    public AuthResponse() {}
    public AuthResponse(String token, String role, Long userId, String email, String firstName, String lastName) {
        this.token = token; this.role = role; this.userId = userId;
        this.email = email; this.firstName = firstName; this.lastName = lastName;
    }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
}

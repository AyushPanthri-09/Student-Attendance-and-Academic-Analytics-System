package com.ayush.academicerp.dto;

public class AuthResponse {

    private String token;

    // Constructor
    public AuthResponse(String token) {
        this.token = token;
    }

    // Getter
    public String getToken() {
        return token;
    }

    // Setter (optional but recommended)
    public void setToken(String token) {
        this.token = token;
    }
}
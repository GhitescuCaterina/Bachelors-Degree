package com.example.playlist_app.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.util.MultiValueMap;
import org.springframework.util.LinkedMultiValueMap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class AuthController {

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.redirect.uri}")
    private String redirectUri;

    public class GoogleIdTokenVerifierExample {
        private final String clientId;
    
        public GoogleIdTokenVerifierExample(String clientId) {
            this.clientId = clientId;
        }
    
        public void verifyToken(String idTokenString) throws Exception {
            JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
    
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(), jsonFactory)
                    .setAudience(Collections.singletonList(clientId))
                    .build();
    
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String userId = payload.getSubject();
                String email = payload.getEmail();
                System.out.println("User ID: " + userId);
                System.out.println("Email: " + email);
            } else {
                System.out.println("Invalid ID token.");
            }
        }
    }
    

    @GetMapping("/auth")
    public ResponseEntity<Void> authenticate() {
        String url = "https://accounts.google.com/o/oauth2/auth?client_id=" +
            clientId + "&redirect_uri=" + redirectUri +
            "&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile";
        return ResponseEntity.status(HttpStatus.FOUND).header("Location", url).build();
    }

    @GetMapping("/oauth2callback")
    public ResponseEntity<?> handleCallback(@RequestParam("code") String code) {
        System.out.println("Received auth code: " + code);

        RestTemplate restTemplate = new RestTemplate();
        String tokenUrl = "https://oauth2.googleapis.com/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
        System.out.println("Client ID: " + clientId);
        System.out.println("Client Secret: " + clientSecret);
        System.out.println("Redirect URI: " + redirectUri);

        requestBody.add("code", code);
        requestBody.add("client_id", clientId);
        requestBody.add("client_secret", clientSecret);
        requestBody.add("redirect_uri", redirectUri);
        requestBody.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    tokenUrl,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            System.out.println("Google OAuth Response: " + response.getBody());

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                System.err.println("Failed OAuth exchange: " + response.getBody());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to exchange code for token.");
            }

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), new TypeReference<>() {});

            if (responseBody.containsKey("error")) {
                System.err.println("OAuth Error: " + responseBody.get("error_description"));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody.get("error_description"));
            }

            String accessToken = (String) responseBody.get("access_token");
            System.out.println("Access Token: " + accessToken);

            String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
            HttpHeaders authHeaders = new HttpHeaders();
            authHeaders.setBearerAuth(accessToken);
            HttpEntity<String> userInfoRequest = new HttpEntity<>(authHeaders);

            ResponseEntity<Map<String, Object>> userInfoResponse = restTemplate.exchange(
                    userInfoUrl,
                    HttpMethod.GET,
                    userInfoRequest,
                    new ParameterizedTypeReference<>() {}
            );

            System.out.println("Google User Info Response: " + userInfoResponse.getBody());
            System.out.println("Sending request to: " + tokenUrl);
            System.out.println("Request Body: " + requestBody.toString());


            Map<String, Object> userInfo = userInfoResponse.getBody();
            if (userInfo == null || !userInfo.containsKey("sub")) {
                System.err.println("Failed to retrieve user information.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to retrieve user information.");
            }

            String userId = (String) userInfo.get("sub");

            return ResponseEntity.ok(Map.of(
                "accessToken", accessToken,
                "userId", userId
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("OAuth token exchange failed: " + e.getMessage());
        }
    }
 


    @GetMapping("/api/videos")
    public ResponseEntity<String> getVideos(@RequestHeader("Authorization") String token) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&myRating=like";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token.replace("Bearer ", ""));
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                String.class
        );

        if (response.getStatusCode().is2xxSuccessful()) {
            return ResponseEntity.ok(response.getBody());
        } else {
            return ResponseEntity.status(response.getStatusCode()).body("Failed to fetch videos.");
        }
    }


    @GetMapping("/api/user-channel")
    public ResponseEntity<String> getUserChannel(@RequestHeader("Authorization") String token) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://www.googleapis.com/youtube/v3/channels?part=id&mine=true";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token.replace("Bearer ", ""));
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, new ParameterizedTypeReference<>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object itemsObj = response.getBody().get("items");
                if (itemsObj instanceof List<?> itemsList && !itemsList.isEmpty()) {
                    Object firstItemObj = itemsList.get(0);
                    if (firstItemObj instanceof Map<?, ?>) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> firstItem = (Map<String, Object>) firstItemObj;
                        String channelId = (String) firstItem.get("id");
                        return ResponseEntity.ok(channelId);
                    }
                }
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User channel ID not found.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving user channel ID.");
        }
    }

    private final RestTemplate restTemplate = new RestTemplate();
    @GetMapping("/api/ytmusic-playlists")
    public ResponseEntity<String> getYTMusicPlaylists() {
        String pythonApiUrl = "http://localhost:5000/playlists";
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(pythonApiUrl, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Failed to fetch playlists from YTMusic API\"}");
        }
    }
    

    @GetMapping("/api/playlist-items")
    public ResponseEntity<String> getPlaylistItems(@RequestParam("playlistId") String playlistId, @RequestHeader("Authorization") String token) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token.replace("Bearer ", ""));
        HttpEntity<Void> request = new HttpEntity<>(headers);
        ObjectMapper objectMapper = new ObjectMapper();
        
        List<Map<String, Object>> allItems = new ArrayList<>();
        String nextPageToken = null;

        try {
            do {
                String url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" 
                        + playlistId + "&maxResults=300";
                if (nextPageToken != null) {
                    url += "&pageToken=" + nextPageToken;
                }
                ResponseEntity<String> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        request,
                        String.class
                );

                if (!response.getStatusCode().is2xxSuccessful()) {
                    return ResponseEntity.status(response.getStatusCode()).body("Failed to fetch playlist items.");
                }
                
                Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), new TypeReference<Map<String, Object>>() {});
                if (responseBody.containsKey("items")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> items = (List<Map<String, Object>>) responseBody.get("items");
                    allItems.addAll(items);
                }
                nextPageToken = (String) responseBody.get("nextPageToken");
            } while (nextPageToken != null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch playlist items.");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("items", allItems);
        
        String resultJson;
        try {
            resultJson = objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing playlist items.");
        }
        
        return ResponseEntity.ok(resultJson);
    }
}
package com.ckd.ai.chatbot.controller;

import com.ckd.ai.chatbot.dto.ChatRequest;
import com.ckd.ai.chatbot.service.ChatbotService;
import com.ckd.ai.user.model.User;
import com.ckd.ai.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        return ResponseEntity.ok(chatbotService.getResponse(request, user));
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        return ResponseEntity.ok(chatbotService.getAvailableContacts(user));
    }

    @GetMapping("/conversation/{recipientId}")
    public ResponseEntity<?> getConversation(@PathVariable Long recipientId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        return ResponseEntity.ok(chatbotService.getConversation(user.getId(), recipientId));
    }
}

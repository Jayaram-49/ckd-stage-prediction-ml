package com.ckd.ai.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponse {
    private String response;
    private String intent;
    private String senderName; // For cross-portal messages
    private String recipientName; // For cross-portal messages
}

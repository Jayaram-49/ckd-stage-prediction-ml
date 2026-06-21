package com.ckd.ai.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageThread {
    private Long id;
    private String message;
    private String senderName;
    private Long senderId; // Add sender ID to identify current user's messages
    private String senderRole;
    private String recipientName;
    private Long recipientId; // Add recipient ID
    private LocalDateTime timestamp;
    private String conversationType;
}

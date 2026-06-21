package com.ckd.ai.chatbot.model;

import com.ckd.ai.user.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chatbot_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TEXT")
    private String userMessage;

    @Column(columnDefinition = "TEXT")
    private String botResponse;

    private String intent;
    private String mode; // PATIENT, DOCTOR
    
    // Cross-portal messaging fields
    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = true)
    private User recipient; // For doctor-patient direct messages
    
    private String conversationType; // AI_CHAT, DOCTOR_PATIENT_MESSAGE

    private LocalDateTime timestamp;

    @PrePersist
    protected void onChat() {
        timestamp = LocalDateTime.now();
    }
}

package com.ckd.ai.chatbot.repository;

import com.ckd.ai.chatbot.model.ChatLog;
import com.ckd.ai.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatLogRepository extends JpaRepository<ChatLog, Long> {
    List<ChatLog> findByUserOrderByTimestampDesc(User user);
    
    @Query("SELECT c FROM ChatLog c WHERE (c.user = :user AND c.recipient = :recipient) OR (c.user = :recipient AND c.recipient = :user) ORDER BY c.timestamp ASC")
    List<ChatLog> findConversationBetweenUsers(@Param("user") User user, @Param("recipient") User recipient);
    
    List<ChatLog> findByRecipientOrderByTimestampDesc(User recipient);
}

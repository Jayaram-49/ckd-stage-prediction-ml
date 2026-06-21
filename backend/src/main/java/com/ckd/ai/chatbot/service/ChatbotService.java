package com.ckd.ai.chatbot.service;

import com.ckd.ai.chatbot.dto.ChatRequest;
import com.ckd.ai.chatbot.dto.ChatResponse;
import com.ckd.ai.chatbot.dto.MessageThread;
import com.ckd.ai.chatbot.model.ChatLog;
import com.ckd.ai.chatbot.repository.ChatLogRepository;
import com.ckd.ai.user.model.Role;
import com.ckd.ai.user.model.User;
import com.ckd.ai.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    @Autowired
    private ChatLogRepository chatLogRepository;

    @Autowired
    private UserRepository userRepository;

    private static final Map<String, String> PATIENT_KB = new HashMap<>();
    private static final Map<String, String> DOCTOR_KB = new HashMap<>();

    static {
        // --- PATIENT KNOWLEDGE BASE (DEEP) ---
        PATIENT_KB.put("ckd",
                "Chronic Kidney Disease (CKD) means your kidneys are damaged and can't filter blood the way they should. It's 'chronic' because the damage happens slowly over a long period of time. This damage can cause wastes to build up in your body and cause other health problems like heart disease and stroke.");

        PATIENT_KB.put("causes",
                "The two main causes of CKD are Diabetes (high blood sugar) and Hypertension (high blood pressure). High blood sugar can damage the small blood vessels in the kidneys, while high blood pressure exerts physical force on the delicate filtering units (nephrons). Other causes include glomerulonephritis, polycystic kidney disease, and long-term use of certain medications like NSAIDs.");

        PATIENT_KB.put("stages",
                "CKD severity is classified into 5 stages using eGFR (estimated Glomerular Filtration Rate):\n" +
                        "- Stage 1: eGFR 90+ (Normal/High, with signs of damage)\n" +
                        "- Stage 2: eGFR 60-89 (Mildly decreased)\n" +
                        "- Stage 3: eGFR 30-59 (Moderately decreased - often requires active management)\n" +
                        "- Stage 4: eGFR 15-29 (Severely decreased - preparation for possible failure)\n" +
                        "- Stage 5: eGFR <15 (Kidney Failure/ESRD - requires dialysis or transplant)");

        PATIENT_KB.put("diet_potassium",
                "When kidneys aren't filtering well, potassium can build up to dangerous levels (Hyperkalemia). \n" +
                        "- AVOID: Bananas, oranges, potatoes, tomatoes, and spinach.\n" +
                        "- CHOOSE: Apples, berries, grapes, cabbage, and cauliflower.\n" +
                        "Tip: Always leach potassium from vegetables by soaking them in water before cooking.");

        PATIENT_KB.put("diet_sodium",
                "Sodium (salt) causes your body to hold onto fluid, increasing blood pressure and straining kidneys. \n"
                        +
                        "- LIMIT: Processed foods, canned soups, and salty snacks.\n" +
                        "- TARGET: Less than 2,000mg per day. Use herbs and spices instead of salt for flavor.");

        PATIENT_KB.put("diet_general",
                "A 'Kidney-Friendly' diet focused on 3 pillars: Low Sodium, Low Potassium, and restricted Phosphorus. Depending on your stage, protein intake may also need to be limited to reduce the workload on your kidneys.");

        PATIENT_KB.put("symptom_proteinuria",
                "Proteinuria (protein in urine) is often noticed as 'foamy' or 'bubbly' urine. This happens when the kidney's filters are leaky, allowing large protein molecules (albumin) to escape into the urine. It is one of the earliest signs of kidney damage.");

        PATIENT_KB.put("symptom_edema",
                "Edema is swelling caused by fluid retention. In CKD, this usually occurs in the ankles, feet, or legs, and sometimes as puffiness around the eyes (periorbital edema). It happens because kidneys can't remove excess salt and water.");

        PATIENT_KB.put("symptoms_general",
                "CKD is often a 'silent' disease until late stages. Common symptoms include persistent fatigue (linked to anemia), foamy urine, swollen ankles, dry/itchy skin, and increased frequency of urination, especially at night.");

        PATIENT_KB.put("tests_detailed",
                "1. eGFR: Calculated from your Serum Creatinine level. It tells us how well your kidneys are filtering (ml/min).\n"
                        +
                        "2. Serum Creatinine: A waste product from muscle breakdown; high levels suggest poor filtering.\n"
                        +
                        "3. Albumin-to-Creatinine Ratio (ACR): A urine test checking for protein leakage. High ACR (30+) is a strong indicator of kidney damage.");

        PATIENT_KB.put("risk_explanation",
                "Your Risk Score is calculated by our AI model using 24 different clinical features including GFR, Hemoglobin, and Blood Pressure. A high risk score (>60%) suggests that without intervention, your condition could progress quickly. Please review your AI Report with your doctor immediately.");

        PATIENT_KB.put("safety",
                "I am an AI Clinical Assistant. While I can provide detailed clinical information and explain your reports, I cannot provide a final diagnosis or prescribe medication. Please consult your nephrologist for all clinical decisions.");

        // --- DOCTOR KNOWLEDGE BASE (DEEP) ---
        DOCTOR_KB.put("model_arch",
                "The core engine is a Multi-Layer Perceptron (MLP) Artificial Neural Network. \n" +
                        "- Architecture: Input layer (24 features) -> 2 Hidden Layers (ReLU) -> Softmax Output.\n" +
                        "- Training: Cross-entropy loss with Adam optimizer.\n" +
                        "- Data: Preprocessed with SMOTE for class balancing and StandardScaling.");

        DOCTOR_KB.put("shap_deep",
                "Explainability is powered by SHAP (SHapley Additive exPlanations). It uses a game-theoretic approach to assign each feature an importance value for a specific prediction. \n"
                        +
                        "- Red features: Increase risk/stage.\n" +
                        "- Blue features: Decrease risk/stage.\n" +
                        "- Mathematical Basis: Reall-time computation of Shapley values ensures consistent and locally accurate feature attribution.");

        DOCTOR_KB.put("kdigo_staging",
                "Staging follows the KDIGO (Kidney Disease: Improving Global Outcomes) guidelines. \n" +
                        "- G1 (>=90), G2 (60-89), G3a (45-59), G3 (30-44), G4 (15-29), G5 (<15).\n" +
                        "- Note: Staging should also consider the 'A' category (Albuminuria levels A1-A3) for a complete risk profile.");

        DOCTOR_KB.put("risk_logic",
                "The risk progression logic utilizes a weighted ensemble approach. The model focuses heavily on Hemoglobin (anemia), Hypertension (dm), and specific gravity. The output probability represents the likelihood of the patient shifting to a higher G-stage within the next clinical cycle.");
    }

    public ChatResponse getResponse(ChatRequest request, User user) {
        if (request.getRecipientId() != null) {
            return sendDirectMessage(request, user);
        }

        String message = request.getMessage().toLowerCase();
        String response;
        String intent = "GENERAL_QUERY";
        String mode = request.getMode() == null ? "PATIENT" : request.getMode().toUpperCase();

        if ("DOCTOR".equals(mode)) {
            // Priority: Technical Details
            if (matches(message, "architecture", "layer", "relu", "optimizer", "mlp")) {
                response = DOCTOR_KB.get("model_arch");
                intent = "MODEL_DETAILS";
            } else if (matches(message, "shap", "math", "shapley", "contribution", "why")) {
                response = DOCTOR_KB.get("shap_deep");
                intent = "EXPLAINABILITY_DEEP";
            } else if (matches(message, "kdigo", "threshold", "g1", "g2", "g3", "g4", "g5")) {
                response = DOCTOR_KB.get("kdigo_staging");
                intent = "CLINICAL_GUIDANCE";
            } else if (matches(message, "logic", "weight", "probability", "progression")) {
                response = DOCTOR_KB.get("risk_logic");
                intent = "RISK_LOGIC";
            } else if (matches(message, "model", "performance", "metric")) {
                response = "The model achieves high F1-score across all 5 CKD stages. Detailed performance metrics (ROC-AUC) are available in the Admin Portal under 'Model Statistics'.";
                intent = "MODEL_STATS";
            } else {
                response = "Doctor Mode: Ask about neural network architecture, SHAP mathematics, KDIGO staging thresholds, or risk weighing logic.";
            }
        } else {
            // Priority: Specific Patient Queries
            if (matches(message, "potassium", "k+")) {
                response = PATIENT_KB.get("diet_potassium");
                intent = "DIET_SPECIFIC";
            } else if (matches(message, "salt", "sodium", "na+")) {
                response = PATIENT_KB.get("diet_sodium");
                intent = "DIET_SPECIFIC";
            } else if (matches(message, "foam", "bubble", "protein", "urine")) {
                response = PATIENT_KB.get("symptom_proteinuria");
                intent = "SYMPTOM_SPECIFIC";
            } else if (matches(message, "swell", "edema", "ankle", "eye")) {
                response = PATIENT_KB.get("symptom_edema");
                intent = "SYMPTOM_SPECIFIC";
            } else if (matches(message, "gfr", "creatinine", "acr", "test")) {
                response = PATIENT_KB.get("tests_detailed");
                intent = "CLINICAL_TESTS";
            } else if (matches(message, "diet", "food", "eat")) {
                response = PATIENT_KB.get("diet_general");
                intent = "DIET_GENERAL";
            } else if (matches(message, "symptom", "feel", "notice")) {
                response = PATIENT_KB.get("symptoms_general");
                intent = "SYMPTOMS_GENERAL";
            } else if (matches(message, "stage", "level", "severe")) {
                response = PATIENT_KB.get("stages");
                intent = "CKD_STAGES";
            } else if (matches(message, "risk", "score", "dangerous")) {
                response = PATIENT_KB.get("risk_explanation");
                intent = "RISK_INFO";
            } else if (matches(message, "define", "ckd", "meaning")) {
                response = PATIENT_KB.get("ckd");
                intent = "CKD_INFO";
            } else if (matches(message, "cause", "why")) {
                response = PATIENT_KB.get("causes");
                intent = "CKD_CAUSES";
            } else {
                response = PATIENT_KB.get("safety");
            }
        }

        ChatLog log = new ChatLog();
        log.setUser(user);
        log.setUserMessage(request.getMessage());
        log.setBotResponse(response);
        log.setIntent(intent);
        log.setMode(mode);
        log.setConversationType("AI_CHAT");

        chatLogRepository.save(log);

        return new ChatResponse(response, intent, null, null);
    }

    private boolean matches(String message, String... keywords) {
        for (String keyword : keywords) {
            if (message.contains(keyword.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    private ChatResponse sendDirectMessage(ChatRequest request, User sender) {
        Long recipientId = request.getRecipientId();
        java.util.Objects.requireNonNull(recipientId, "recipientId");
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        // Validate: Doctor can message Patient, Patient can message Doctor
        boolean senderIsDoctor = sender.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_DOCTOR"));
        boolean recipientIsDoctor = recipient.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_DOCTOR"));

        if (senderIsDoctor == recipientIsDoctor) {
            throw new RuntimeException("Cross-portal messaging only allowed between Doctor and Patient");
        }

        ChatLog message = new ChatLog();
        message.setUser(sender);
        message.setRecipient(recipient);
        message.setUserMessage(request.getMessage());
        message.setBotResponse("Message sent to "
                + (recipient.getFullName() != null ? recipient.getFullName() : recipient.getUsername()));
        message.setConversationType("DOCTOR_PATIENT_MESSAGE");
        message.setMode(senderIsDoctor ? "DOCTOR" : "PATIENT");

        chatLogRepository.save(message);

        return new ChatResponse(
                "Message sent to "
                        + (recipient.getFullName() != null ? recipient.getFullName() : recipient.getUsername()),
                "DIRECT_MESSAGE",
                sender.getFullName() != null ? sender.getFullName() : sender.getUsername(),
                recipient.getFullName() != null ? recipient.getFullName() : recipient.getUsername());
    }

    public List<MessageThread> getConversation(Long userId, Long recipientId) {
        java.util.Objects.requireNonNull(userId, "userId");
        java.util.Objects.requireNonNull(recipientId, "recipientId");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        List<ChatLog> logs = chatLogRepository.findConversationBetweenUsers(user, recipient);

        return logs.stream().map(log -> new MessageThread(
                log.getId(),
                log.getUserMessage(),
                log.getUser().getFullName() != null ? log.getUser().getFullName() : log.getUser().getUsername(),
                log.getUser().getId(),
                log.getUser().getRoles().stream().map(Role::getName).findFirst().orElse(""),
                log.getRecipient() != null
                        ? (log.getRecipient().getFullName() != null ? log.getRecipient().getFullName()
                                : log.getRecipient().getUsername())
                        : "",
                log.getRecipient() != null ? log.getRecipient().getId() : null,
                log.getTimestamp(),
                log.getConversationType())).collect(Collectors.toList());
    }

    public List<User> getAvailableContacts(User currentUser) {
        boolean isDoctor = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_DOCTOR"));

        List<User> contacts;
        if (isDoctor) {
            // Doctor sees all patients (excluding self)
            contacts = userRepository.findAll().stream()
                    .filter(u -> !u.getId().equals(currentUser.getId())) // Exclude self
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_PATIENT")))
                    .collect(Collectors.toList());
        } else {
            // Patient sees all doctors (excluding self)
            contacts = userRepository.findAll().stream()
                    .filter(u -> !u.getId().equals(currentUser.getId())) // Exclude self
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_DOCTOR")))
                    .collect(Collectors.toList());
        }

        // Log for debugging
        System.out.println("Current User: " + currentUser.getUsername() + " (ID: " + currentUser.getId() + ")");
        System.out.println("Is Doctor: " + isDoctor);
        System.out.println("Found " + contacts.size() + " contacts");
        contacts.forEach(c -> System.out.println("  - " + c.getUsername() + " (" + c.getFullName() + ")"));

        return contacts;
    }
}

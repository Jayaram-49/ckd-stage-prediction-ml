-- Manual SQL script to update chatbot_logs table if needed
-- Run this in MySQL if you get "Column 'recipient_id' doesn't exist" error
-- Run each ALTER TABLE separately - if column exists, it will show an error, which is fine

USE ckd_db;

-- Check if columns exist first, then add them
-- If you get "Duplicate column name" error, the column already exists - that's OK

-- Add recipient_id column
ALTER TABLE chatbot_logs 
ADD COLUMN recipient_id BIGINT NULL;

-- Add conversation_type column  
ALTER TABLE chatbot_logs 
ADD COLUMN conversation_type VARCHAR(50) NULL;

-- Add foreign key constraint (drop first if exists, then add)
ALTER TABLE chatbot_logs 
DROP FOREIGN KEY IF EXISTS fk_chatbot_logs_recipient;

ALTER TABLE chatbot_logs 
ADD CONSTRAINT fk_chatbot_logs_recipient 
FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;

-- Verify the table structure
DESCRIBE chatbot_logs;

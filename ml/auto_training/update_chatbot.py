import pandas as pd
import os
import sqlite3 # Using a local sqlite for chatbot knowledge if DB not ready, or just update CSV

def update_chatbot_knowledge(csv_path):
    if not os.path.exists(csv_path):
        print("CSV file not found.")
        return
    
    df = pd.read_csv(csv_path)
    print(f"Imported {len(df)} knowledge records.")
    
    # In this implementation, the chatbot service in Java reads from a map.
    # To make it "Instant", the Admin can upload CSV which updates a local storage.
    # For this project, we'll save it to a persistent JSON/CSV that Java can watch.
    df.to_json('ml/data/chatbot_knowledge.json', orient='records')
    print("Chatbot NLP brain updated successfully.")

if __name__ == "__main__":
    # Simulate admin upload
    update_chatbot_knowledge('ml/data/chatbot_knowledge.csv')

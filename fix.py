import os

# 1. Read the corrupted Windows file (cp1252 encoding)
print("Reading data.json...")
try:
    with open('data.json', 'r', encoding='cp1252') as f:
        content = f.read()
        
    # 2. Save it as clean UTF-8
    print("Converting to data_utf8.json...")
    with open('data_utf8.json', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("✅ Success! 'data_utf8.json' created.")
    
except FileNotFoundError:
    print("❌ Error: Could not find data.json in this folder.")
except Exception as e:
    print(f"❌ Error: {e}")
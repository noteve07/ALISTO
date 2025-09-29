import json
import sys
from pathlib import Path

"""
This script fixes encoding issues with the municities.json file.
It reads the file with a more permissive encoding (latin-1) and writes it back out as proper UTF-8.
"""

def fix_encoding():
    # Paths
    src_dir = Path(__file__).parent.parent.parent / "src"
    original_file = src_dir / "municities.json"
    backup_file = src_dir / "municities_original.json"
    fixed_file = src_dir / "municities_fixed.json"
    
    if not original_file.exists():
        print(f"❌ Original file not found: {original_file}")
        return False
    
    print(f"📂 Found original file: {original_file}")
    
    # Create backup if it doesn't exist
    if not backup_file.exists():
        print(f"📦 Creating backup: {backup_file}")
        try:
            backup_file.write_bytes(original_file.read_bytes())
            print("✅ Backup created")
        except Exception as e:
            print(f"❌ Failed to create backup: {e}")
            return False
    
    # Try different encodings to read the file
    encodings_to_try = ["latin-1", "cp1252", "iso-8859-1", "utf-8-sig"]
    json_data = None
    
    for encoding in encodings_to_try:
        try:
            print(f"🔄 Trying to read with {encoding} encoding...")
            with open(original_file, "r", encoding=encoding) as f:
                content = f.read()
                json_data = json.loads(content)
            print(f"✅ Successfully read with {encoding} encoding")
            break
        except UnicodeDecodeError:
            print(f"❌ Failed to decode with {encoding} encoding")
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON with {encoding} encoding")
        except Exception as e:
            print(f"❌ Error with {encoding}: {e}")
    
    if not json_data:
        print("❌ Failed to read the file with any encoding")
        return False
    
    # Write the file with proper UTF-8 encoding
    try:
        print(f"📝 Writing fixed file to: {fixed_file}")
        with open(fixed_file, "w", encoding="utf-8") as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        print("✅ Fixed file written with UTF-8 encoding")
        
        # Optionally replace the original file
        replace = input("🤔 Replace original file with fixed version? (y/n): ").strip().lower()
        if replace == 'y':
            print("🔄 Replacing original file...")
            with open(original_file, "w", encoding="utf-8") as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
            print("✅ Original file replaced with fixed version")
        
        return True
    except Exception as e:
        print(f"❌ Failed to write fixed file: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Municities JSON Encoding Fixer 🔧")
    print("-----------------------------------")
    
    success = fix_encoding()
    
    if success:
        print("\n✅ Encoding fix completed successfully!")
        print("You can now run init_municities_data.py again")
    else:
        print("\n❌ Failed to fix encoding issues")
        print("Please check the file manually or contact support")
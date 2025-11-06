#!/usr/bin/env python3
"""
Database connection helper - helps you connect to your PostgreSQL database
"""

import psycopg2
from psycopg2.extras import RealDictCursor

def test_connection():
    """Interactive database connection tester"""
    print("🔗 Database Connection Helper")
    print("=" * 40)
    
    # Get database details
    print("\nPlease provide your database connection details:")
    host = input("🏠 Host (default: localhost): ").strip() or "localhost"
    port = input("🚪 Port (default: 5432): ").strip() or "5432"
    database = input("🗄️  Database name: ").strip()
    user = input("👤 Username: ").strip()
    password = input("🔐 Password: ").strip()
    
    print(f"\n🔄 Testing connection to {database}@{host}:{port}...")
    
    try:
        # Test connection
        conn = psycopg2.connect(
            host=host,
            port=int(port),
            database=database,
            user=user,
            password=password
        )
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ Connection successful!")
        
        # Check if provinces table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'provinces'
            );
        """)
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            print("✅ 'provinces' table found!")
            
            # Check table structure
            cursor.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'provinces'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            
            print(f"\n📋 Table structure:")
            for col in columns:
                print(f"  - {col['column_name']}: {col['data_type']}")
            
            # Check row count
            cursor.execute("SELECT COUNT(*) FROM provinces;")
            count = cursor.fetchone()[0]
            print(f"\n📊 Total provinces: {count}")
            
            # Show sample data
            cursor.execute("SELECT province_id, name FROM provinces LIMIT 5;")
            samples = cursor.fetchall()
            print(f"\n🔍 Sample provinces:")
            for sample in samples:
                print(f"  - {sample['province_id']}: {sample['name']}")
                
            # Check for boundaries
            cursor.execute("""
                SELECT COUNT(*) FROM provinces 
                WHERE boundaries IS NOT NULL;
            """)
            boundaries_count = cursor.fetchone()[0]
            print(f"\n🗺️  Provinces with boundaries: {boundaries_count}")
            
        else:
            print("❌ 'provinces' table not found!")
            
            # List available tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            print(f"\n📋 Available tables:")
            for table in tables:
                print(f"  - {table['table_name']}")
        
        conn.close()
        
        # Generate connection config
        print(f"\n💾 Save these settings for the script:")
        print(f"DB_HOST={host}")
        print(f"DB_PORT={port}")
        print(f"DB_NAME={database}")
        print(f"DB_USER={user}")
        print(f"DB_PASSWORD={password}")
        
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Connection failed: {e}")
        print(f"\n💡 Common issues:")
        print(f"  - PostgreSQL server not running")
        print(f"  - Wrong database name, username, or password")
        print(f"  - Database doesn't exist")
        print(f"  - Connection not allowed from this host")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_connection()
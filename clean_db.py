import sqlite3

db_path = r'C:\Users\pathi\.gemini\antigravity\scratch\sri-lakshmi-ganapathi\slg_store.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Clear all demo orders
cur.execute('DELETE FROM orders')

# 2. Clear all demo enquiries
cur.execute('DELETE FROM enquiries')

# 3. Clear all demo notifications
cur.execute('DELETE FROM notifications')

# 4. Clear all demo referrals
cur.execute('DELETE FROM referrals')

# 5. Clear all demo customers (keep ONLY the owner AnandMajji)
cur.execute("DELETE FROM users WHERE role != 'owner'")
cur.execute("UPDATE users SET wallet_balance = 0.0 WHERE role = 'owner'")

conn.commit()

print('Orders count:', cur.execute('SELECT COUNT(*) FROM orders').fetchone()[0])
print('Users count:', cur.execute('SELECT COUNT(*) FROM users').fetchone()[0])
print('Enquiries count:', cur.execute('SELECT COUNT(*) FROM enquiries').fetchone()[0])
print('Notifications count:', cur.execute('SELECT COUNT(*) FROM notifications').fetchone()[0])

owner = cur.execute('SELECT id, username, full_name, mobile, role FROM users').fetchall()
print('Remaining accounts:', owner)

conn.close()
print('All demo data completely erased from slg_store.db!')

import sqlite3
import os
import json
from datetime import datetime, timedelta
import random
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), 'slg_store.db')

def init_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        mobile TEXT UNIQUE NOT NULL,
        email TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        referral_code TEXT UNIQUE NOT NULL,
        referred_by TEXT,
        wallet_balance REAL DEFAULT 0.0,
        addresses TEXT DEFAULT '[]',
        created_at TEXT NOT NULL
    )
    ''')

    # Products table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_te TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        description_te TEXT,
        size TEXT NOT NULL,
        pack_size INTEGER DEFAULT 25,
        price REAL NOT NULL,
        price_per_piece REAL NOT NULL,
        in_stock INTEGER DEFAULT 1,
        image_url TEXT,
        badge TEXT,
        rating REAL DEFAULT 4.9,
        reviews_count INTEGER DEFAULT 45,
        is_bestseller INTEGER DEFAULT 0
    )
    ''')

    # Orders table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_mobile TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        delivery_notes TEXT,
        items_json TEXT NOT NULL,
        subtotal REAL NOT NULL,
        bulk_discount REAL DEFAULT 0.0,
        coupon_code TEXT,
        coupon_discount REAL DEFAULT 0.0,
        referral_credit_used REAL DEFAULT 0.0,
        delivery_fee REAL DEFAULT 0.0,
        gst_amount REAL DEFAULT 0.0,
        total_amount REAL NOT NULL,
        payment_mode TEXT NOT NULL,
        payment_status TEXT DEFAULT 'Pending',
        upi_ref_id TEXT,
        order_status TEXT DEFAULT 'Placed',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    ''')

    # Coupons table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        discount_type TEXT NOT NULL,
        discount_value REAL NOT NULL,
        min_order REAL DEFAULT 0.0,
        start_date TEXT,
        end_date TEXT,
        usage_limit INTEGER DEFAULT 1000,
        times_used INTEGER DEFAULT 0,
        first_order_only INTEGER DEFAULT 0,
        category_limit TEXT DEFAULT 'all',
        is_active INTEGER DEFAULT 1,
        show_banner INTEGER DEFAULT 1,
        banner_text TEXT
    )
    ''')

    # Referrals table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer_user_id INTEGER NOT NULL,
        referred_user_id INTEGER NOT NULL,
        referrer_reward REAL DEFAULT 100.0,
        friend_reward REAL DEFAULT 50.0,
        status TEXT DEFAULT 'pending',
        order_id TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT
    )
    ''')

    # Enquiries table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS enquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        event_type TEXT,
        event_date TEXT,
        quantity TEXT,
        message TEXT,
        status TEXT DEFAULT 'New',
        created_at TEXT NOT NULL
    )
    ''')

    # Settings table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    ''')

    # Notifications table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        target TEXT DEFAULT 'owner',
        target_id TEXT,
        data_json TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    ''')

    conn.commit()

    # Seed Settings
    settings_data = {
        'delivery_fee': '40',
        'free_delivery_threshold': '500',
        'min_order_amount': '100',
        'bulk_discount_pct': '5',
        'bulk_discount_threshold': '2000',
        'gst_enabled': '0',
        'gst_rate': '5',
        'referrer_reward_amt': '100',
        'friend_reward_amt': '50',
        'opening_hours': '7:30 AM - 9:00 PM (Monday - Sunday)',
        'business_name': 'SRI LAKSHMI GANAPATHI - ARECA PLATES MANUFACTURERS',
        'business_tagline': 'Sustainable. Natural. Pure.',
        'business_address': '8-176, Block 3, Sunkaravaari Thota, Madhepalli Road, Eluru, Eluru District, Andhra Pradesh 534001',
        'business_phones': '9849052800, 9642677869, 9346326432, 8309729149',
        'owner_mobile': '9642677869',
        'upi_id': 'anandmajji141@axl'
    }

    for k, v in settings_data.items():
        cursor.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (k, v))

    # Seed Owner Account
    # Username: AnandMajji, Password: @n@nd@123, Mobile: 9642677869
    owner_hash = generate_password_hash('@n@nd@123')
    owner_addresses = json.dumps([
        {
            "id": 1,
            "type": "Factory / Office",
            "name": "Anand Majji",
            "mobile": "9642677869",
            "address": "8-176, Block 3, Sunkaravaari Thota, Madhepalli Road, Eluru, AP 534001",
            "is_default": True
        }
    ])
    cursor.execute('''
    INSERT OR REPLACE INTO users (id, username, full_name, mobile, email, password_hash, role, referral_code, wallet_balance, addresses, created_at)
    VALUES (1, 'AnandMajji', 'Anand Majji (Owner)', '9642677869', 'anandmajji141@gmail.com', ?, 'owner', 'SLG-ANAND', 0.0, ?, ?)
    ''', (owner_hash, owner_addresses, datetime.now().isoformat()))

    # Clean any demo customers
    cursor.execute("DELETE FROM users WHERE role != 'owner'")

    # Clear products before seeding
    cursor.execute('DELETE FROM products')

    # Seed Products accurately according to specifications
    products = [
        # Round Plates (Pack of 25)
        (
            '6 Inch Round Plate',
            '6 అంగుళాల గుండ్రని ప్లేట్',
            'round_plates',
            'Compact natural areca leaf plate. Perfect for tiffins, snacks, sweets, breakfast and prasadam servings.',
            'అల్పాహారం, స్నాక్స్, ప్రసాదం మరియు టిఫిన్ వడ్డించడానికి అనువైన సహజమైన అరెకా ఆకు ప్లేట్.',
            '6 Inch',
            25,
            110.0,
            4.40,
            1,
            '/static/assets/images/round_plate_set.jpg',
            'Snack & Tiffin',
            4.8,
            64,
            0
        ),
        (
            '8 Inch Round Plate',
            '8 అంగుళాల గుండ్రని ప్లేట్',
            'round_plates',
            'Versatile medium round plate. Ideal for light meals, chaat, evening snacks, and puja distribution.',
            'తేలికపాటి భోజనం, చాట్, సాయంత్రం స్నాక్స్ మరియు పూజల కోసం అద్భుతమైన మధ్యస్థ పరిమాణ ప్లేట్.',
            '8 Inch',
            25,
            160.0,
            6.40,
            1,
            '/static/assets/images/round_plates_stack.jpg',
            'Popular Choice',
            4.9,
            92,
            1
        ),
        (
            '10 Inch Round Plate',
            '10 అంగుళాల గుండ్రని ప్లేట్',
            'round_plates',
            'Full meal dinner plate with deep rim. Sturdy, leak-proof, hot gravy resistant. Most demanded for weddings & parties.',
            'పూర్తి భోజనం కోసం బలమైన గుండ్రని ప్లేట్. వేడి సాంబార్, కూరలను తట్టుకుంటుంది. వివాహాలకు అత్యంత ప్రసిద్ధి.',
            '10 Inch',
            25,
            220.0,
            8.80,
            1,
            '/static/assets/images/round_plate_set.jpg',
            'Best Seller #1',
            5.0,
            184,
            1
        ),
        (
            '12 Inch Round Platter',
            '12 అంగుళాల పెద్ద గుండ్రని పళ్ళెం',
            'round_plates',
            'Grand feast platter. Generous dining space for Andhra traditional thali, festive meals, and multi-dish catering.',
            'ఆంధ్ర విందు భోజనం, సాంప్రదాయ తాళి మరియు శుభకార్యాల కోసం గ్రాండ్ పళ్ళెం.',
            '12 Inch',
            25,
            280.0,
            11.20,
            1,
            '/static/assets/images/round_plates_stack.jpg',
            'Grand Platter',
            4.9,
            76,
            1
        ),

        # Square Plates (Pack of 25)
        (
            '4 Inch Square Plate',
            '4 అంగుళాల చతురస్ర ప్లేట్',
            'square_plates',
            'Chic miniature square plate for desserts, dry fruits, starters, and traditional sweets.',
            'స్వీట్లు, డ్రై ఫ్రూట్స్, స్టార్టర్స్ మరియు తీపి పదార్థాల కోసం సొగసైన చిన్న చతురస్ర ప్లేట్.',
            '4 Inch',
            25,
            90.0,
            3.60,
            1,
            '/static/assets/images/square_plates_nested.jpg',
            'Sweet & Starter',
            4.7,
            38,
            0
        ),
        (
            '6 Inch Square Plate',
            '6 అంగుళాల చతురస్ర ప్లేట్',
            'square_plates',
            'Contemporary square appetizer plate. Excellent for pastries, samosas, appetizers, and breakfast items.',
            'సమోసాలు, పేస్ట్రీలు, అల్పాహారం మరియు ఈవెనింగ్ స్టార్టర్స్ కోసం ఆధునిక చతురస్ర ప్లేట్.',
            '6 Inch',
            25,
            130.0,
            5.20,
            1,
            '/static/assets/images/square_plates_stack.jpg',
            'Modern Dining',
            4.8,
            51,
            0
        ),
        (
            '8 Inch Square Plate',
            '8 అంగుళాల చతురస్ర ప్లేట్',
            'square_plates',
            'Designer medium square plate with raised spill-safe edges. High aesthetic dining for modern functions.',
            'ఎత్తైన అంచులతో కూడిన డిజైనర్ మీడియం స్క్వేర్ ప్లేట్. ఆధునిక వేడుకలకు ఆకర్షణీయమైన ఎంపిక.',
            '8 Inch',
            25,
            180.0,
            7.20,
            1,
            '/static/assets/images/square_plates_nested.jpg',
            'Top Rated',
            4.9,
            87,
            1
        ),
        (
            '10 Inch Square Plate',
            '10 అంగుళాల చతురస్ర ప్లేట్',
            'square_plates',
            'Premium full-course square plate. Elegant buffet dining presentation, highly rigid and heat-resistant.',
            'ప్రీమియం బఫే డిన్నర్ స్క్వేర్ ప్లేట్. దృఢమైన నిర్మాణం, వేడిని నిరోధించే సహజ ఆకు ఆకృతి.',
            '10 Inch',
            25,
            240.0,
            9.60,
            1,
            '/static/assets/images/square_plates_stack.jpg',
            'Buffet Special',
            4.9,
            110,
            1
        ),

        # Bowls (Pack of 25)
        (
            '4 Inch Round Bowl',
            '4 అంగుళాల గుండ్రని గిన్నె (బౌల్)',
            'bowls',
            'Deep natural palm leaf bowl for dal, sambar, rasam, curd, payasam, and chutneys. Completely leak proof.',
            'పప్పు, సాంబార్, రసం, పెరుగు మరియు పాయసం కోసం లోతైన లీక్-ప్రూఫ్ అరెకా గిన్నె.',
            '4 Inch',
            25,
            100.0,
            4.00,
            1,
            '/static/assets/images/round_plate_set.jpg',
            'Curry & Sambar',
            4.9,
            120,
            1
        ),
        (
            '4 Inch Square Bowl',
            '4 అంగుళాల చతురస్ర గిన్నె (బౌల్)',
            'bowls',
            'Stylish square bowl with modern finish. Great for ice cream, desserts, dips, and gravies.',
            'ఐస్ క్రీమ్, డెజర్ట్‌లు, పచ్చళ్ళు మరియు గ్రేవీల కోసం సరికొత్త చతురస్ర గిన్నె.',
            '4 Inch',
            25,
            100.0,
            4.00,
            1,
            '/static/assets/images/square_bowls_stack.jpg',
            'Dessert Bowl',
            4.8,
            55,
            0
        ),
        (
            '5 Inch Round Bowl',
            '5 అంగుళాల గుండ్రని గిన్నె (బౌల్)',
            'bowls',
            'Extra deep large bowl for soups, biryani portions, pulihora, curd rice, and curries.',
            'సూప్స్, బిర్యానీ, పులిహోర మరియు పెద్ద పరిమాణ కూరల కోసం లోతైన పెద్ద గిన్నె.',
            '5 Inch',
            25,
            130.0,
            5.20,
            1,
            '/static/assets/images/round_plate_set.jpg',
            'Extra Deep',
            4.9,
            68,
            0
        ),

        # Cutlery (Pack of 25 sets: spoon, fork, knife)
        (
            'Natural Birchwood Cutlery Set (Pack of 25 Sets)',
            'సహజ చెక్క కట్లరీ సెట్ (25 సెట్లు - చెంచా, ఫోర్క్, కత్తి)',
            'cutlery',
            'Eco-friendly smooth wooden cutlery set. Pack contains 25 spoons, 25 forks, and 25 knives. Splinter-free & food safe.',
            'పర్యావరణ అనుకూల చెక్క కట్లరీ సెట్. ప్రతి సెట్‌లో 25 చెంచాలు, 25 ఫోర్కులు మరియు 25 కత్తులు ఉంటాయి.',
            'Standard Pack of 25 Sets',
            25,
            120.0,
            4.80,
            1,
            '/static/assets/images/combo_wedding_tray.jpg',
            '100% Eco Cutlery',
            4.8,
            74,
            0
        ),

        # Combos
        (
            'Party Combo Pack',
            'పార్టీ కాంబో ప్యాక్ (50 ప్లేట్లు + 50 బౌల్స్ + 50 కట్లరీ)',
            'combos',
            'Complete party pack for 50 guests: 50 x 10" Round Plates, 50 x 4" Round Bowls, and 50 Wooden Cutlery sets. Huge savings!',
            '50 మంది అతిథుల కోసం పూర్తి పార్టీ ప్యాక్: 50 x 10 అంగుళాల ప్లేట్లు + 50 గిన్నెలు + 50 కట్లరీ సెట్లు.',
            '50 Guest Combo',
            50,
            800.0,
            16.00,
            1,
            '/static/assets/images/combo_wedding_tray.jpg',
            'Save ₹160 • Hot Combo',
            5.0,
            142,
            1
        ),
        (
            'Wedding & Function Grand Combo',
            'వివాహ & వేడుక గ్రాండ్ కాంబో (100 ప్లేట్లు + 100 బౌల్స్ + 100 కట్లరీ)',
            'combos',
            'Mega catering combo for 100 guests: 100 x 10" Round Dinner Plates, 100 x 4" Round Bowls, and 100 Wooden Cutlery sets.',
            '100 మంది అతిథుల కోసం గ్రాండ్ వెడ్డింగ్ కాంబో: 100 x 10 అంగుళాల ప్లేట్లు + 100 గిన్నెలు + 100 కట్లరీ సెట్లు.',
            '100 Guest Combo',
            100,
            1600.0,
            16.00,
            1,
            '/static/assets/images/combo_wedding_tray.jpg',
            'Save ₹320 • Best for Weddings',
            5.0,
            205,
            1
        )
    ]

    cursor.executemany('''
    INSERT INTO products (name, name_te, category, description, description_te, size, pack_size, price, price_per_piece, in_stock, image_url, badge, rating, reviews_count, is_bestseller)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', products)

    # Clear dynamic tables so clean production slate is preserved
    cursor.execute('DELETE FROM coupons')
    cursor.execute('DELETE FROM orders')
    cursor.execute('DELETE FROM enquiries')
    cursor.execute('DELETE FROM notifications')

    conn.commit()
    conn.close()
    print("Database slg_store.db initialized successfully with clean production slate (zero fake orders/coupons/enquiries)!")

if __name__ == '__main__':
    init_database()

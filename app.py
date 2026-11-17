import os
import sqlite3
import json
import time
from datetime import datetime, timedelta
import io
import csv
import urllib.parse

from flask import Flask, request, jsonify, send_from_directory, send_file, Response
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
import qrcode

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "slg_store.db")
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Auto-initialize database schema and catalog if not present
def ensure_db():
    if not os.path.exists(DB_PATH) or os.path.getsize(DB_PATH) == 0:
        try:
            import init_db
            init_db.init_database()
        except Exception as e:
            print("Auto init DB notice:", e)

ensure_db()

JWT_SECRET = "slg_areca_eluru_super_secret_jwt_key_2026"
JWT_ALGORITHM = "HS256"

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="/static")

# Helper DB connection
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Helper for settings
def get_setting(key: str, default: str = "") -> str:
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT value FROM settings WHERE key = ?", (key,))
        row = cur.fetchone()
        return row["value"] if row else default

def get_all_settings():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT key, value FROM settings")
        rows = cur.fetchall()
        return {r["key"]: r["value"] for r in rows}

# Authentication Helpers
def create_token(user_id: int, username: str, role: str) -> str:
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        return None

def get_current_user():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header:
        return None
    parts = auth_header.split(" ")
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
    else:
        token = auth_header
    payload = decode_token(token)
    if not payload:
        return None
    user_id = int(payload["sub"])
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, username, full_name, mobile, email, role, referral_code, wallet_balance, addresses FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        if row:
            u = dict(row)
            try:
                u["addresses"] = json.loads(u["addresses"])
            except Exception:
                u["addresses"] = []
            return u
    return None

# ----------------- AUTH ENDPOINTS -----------------

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(force=True) or {}
    full_name = data.get("full_name", "").strip()
    username = data.get("username", "").strip()
    password = data.get("password", "")
    mobile = data.get("mobile", "").strip().replace(" ", "").replace("-", "")
    email = data.get("email", "").strip()
    address = data.get("address", "").strip()
    ref_code = data.get("referral_code", "").strip()

    if len(password) < 8:
        return jsonify({"detail": "Password must be at least 8 characters long"}), 400
    if len(mobile) < 10:
        return jsonify({"detail": "Please enter a valid 10-digit mobile number"}), 400

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE LOWER(username) = LOWER(?)", (username,))
        if cur.fetchone():
            return jsonify({"detail": "Username is already taken. Please choose another."}), 400

        cur.execute("SELECT id FROM users WHERE mobile = ?", (mobile,))
        if cur.fetchone():
            return jsonify({"detail": "An account already exists with this mobile number. Please login."}), 400

        base_ref = "SLG" + full_name[:3].upper().replace(" ", "A")
        cur.execute("SELECT COUNT(*) as cnt FROM users")
        cnt = cur.fetchone()["cnt"] + 101
        user_ref_code = f"{base_ref}{cnt}"

        referred_by_user = None
        friend_reward_amt = float(get_setting("friend_reward_amt", "50"))
        wallet_bal = 0.0

        if ref_code:
            cur.execute("SELECT id, username FROM users WHERE referral_code = ?", (ref_code.upper(),))
            ref_row = cur.fetchone()
            if ref_row:
                referred_by_user = ref_row["username"]
                wallet_bal = friend_reward_amt

        initial_addresses = []
        if address:
            initial_addresses.append({
                "id": 1,
                "type": "Home",
                "name": full_name,
                "mobile": mobile,
                "address": address,
                "is_default": False
            })

        pw_hash = generate_password_hash(password)
        now_str = datetime.now().isoformat()

        cur.execute('''
        INSERT INTO users (username, full_name, mobile, email, password_hash, role, referral_code, referred_by, wallet_balance, addresses, created_at)
        VALUES (?, ?, ?, ?, ?, 'customer', ?, ?, ?, ?, ?)
        ''', (
            username, full_name, mobile, email, pw_hash, user_ref_code,
            referred_by_user, wallet_bal, json.dumps(initial_addresses), now_str
        ))
        user_id = cur.lastrowid

        if referred_by_user:
            cur.execute("SELECT id FROM users WHERE username = ?", (referred_by_user,))
            ref_id_row = cur.fetchone()
            if ref_id_row:
                referrer_reward = float(get_setting("referrer_reward_amt", "100"))
                cur.execute('''
                INSERT INTO referrals (referrer_user_id, referred_user_id, referrer_reward, friend_reward, status, created_at)
                VALUES (?, ?, ?, ?, 'pending', ?)
                ''', (ref_id_row["id"], user_id, referrer_reward, friend_reward_amt, now_str))

        conn.commit()

        token = create_token(user_id, username, "customer")
        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "username": username,
                "full_name": full_name,
                "mobile": mobile,
                "email": email,
                "role": "customer",
                "referral_code": user_ref_code,
                "wallet_balance": wallet_bal,
                "addresses": initial_addresses
            }
        })

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(force=True) or {}
    clean_user = data.get("username", "").strip()
    password = data.get("password", "")

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('''
        SELECT id, username, full_name, mobile, email, password_hash, role, referral_code, wallet_balance, addresses
        FROM users
        WHERE LOWER(username) = LOWER(?) OR mobile = ?
        ''', (clean_user, clean_user))
        user_row = cur.fetchone()

        if not user_row:
            return jsonify({"detail": "Account not found. Please register to login."}), 404

        if not check_password_hash(user_row["password_hash"], password):
            return jsonify({"detail": "Incorrect password. Please try again."}), 401

        user_dict = dict(user_row)
        user_id = user_dict["id"]
        role = user_dict["role"]

        try:
            addresses = json.loads(user_dict["addresses"])
        except Exception:
            addresses = []

        token = create_token(user_id, user_dict["username"], role)

        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "username": user_dict["username"],
                "full_name": user_dict["full_name"],
                "mobile": user_dict["mobile"],
                "email": user_dict["email"],
                "role": role,
                "referral_code": user_dict["referral_code"],
                "wallet_balance": user_dict["wallet_balance"],
                "addresses": addresses
            }
        })

@app.route("/api/auth/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json(force=True) or {}
    mobile = data.get("mobile", "").strip().replace(" ", "").replace("-", "")
    if len(mobile) < 10:
        return jsonify({"detail": "Invalid mobile number"}), 400
    return jsonify({
        "success": True,
        "message": f"6-digit OTP sent to {mobile} via SMS",
        "mock_otp": "123456"
    })

@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json(force=True) or {}
    otp = data.get("otp", "").strip()
    if otp == "123456" or len(otp) == 6:
        return jsonify({"success": True, "message": "OTP verified successfully"})
    return jsonify({"detail": "Invalid OTP code. Please enter 123456."}), 400

@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(force=True) or {}
    mobile = data.get("mobile", "").strip().replace(" ", "").replace("-", "")
    new_pw = data.get("new_password", "")
    if len(new_pw) < 8:
        return jsonify({"detail": "Password must be at least 8 characters"}), 400

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE mobile = ?", (mobile,))
        user = cur.fetchone()
        if not user:
            return jsonify({"detail": "No account found with this mobile number"}), 404

        new_hash = generate_password_hash(new_pw)
        cur.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user["id"]))
        conn.commit()

    return jsonify({"success": True, "message": "Password reset successfully. You can now login."})

@app.route("/api/auth/me", methods=["GET"])
def get_me():
    user = get_current_user()
    if not user:
        return jsonify({"detail": "Authentication required"}), 401
    return jsonify({"success": True, "user": user})

@app.route("/api/auth/profile", methods=["PUT"])
def update_profile():
    user = get_current_user()
    if not user:
        return jsonify({"detail": "Authentication required"}), 401
    data = request.get_json(force=True) or {}
    user_id = user["id"]
    with get_db() as conn:
        cur = conn.cursor()
        full_name = data.get("full_name", user["full_name"]).strip()
        email = data.get("email", user.get("email", "")).strip()
        mobile = data.get("mobile", user.get("mobile", "")).strip().replace(" ", "").replace("-", "")
        if mobile and mobile != user["mobile"]:
            cur.execute("SELECT id FROM users WHERE mobile = ? AND id != ?", (mobile, user_id))
            if cur.fetchone():
                return jsonify({"detail": "Mobile number already in use by another account"}), 400
        else:
            mobile = user["mobile"]

        addresses = data.get("addresses", user.get("addresses", []))
        cur.execute('''
        UPDATE users SET full_name = ?, email = ?, mobile = ?, addresses = ? WHERE id = ?
        ''', (full_name, email, mobile, json.dumps(addresses), user_id))
        conn.commit()

        cur.execute("SELECT id, username, full_name, mobile, email, role, referral_code, wallet_balance, addresses FROM users WHERE id = ?", (user_id,))
        updated_row = cur.fetchone()
        u = dict(updated_row)
        try:
            u["addresses"] = json.loads(u["addresses"])
        except Exception:
            u["addresses"] = []
    return jsonify({"success": True, "message": "Profile updated successfully", "user": u})

# ----------------- PRODUCTS ENDPOINTS -----------------

@app.route("/api/products", methods=["GET"])
def get_products():
    category = request.args.get("category")
    search = request.args.get("search")
    sort = request.args.get("sort")
    bestseller_only = request.args.get("bestseller_only") == "true"

    with get_db() as conn:
        cur = conn.cursor()
        query = "SELECT * FROM products WHERE 1=1"
        params = []

        if category and category != "all":
            query += " AND category = ?"
            params.append(category)

        if bestseller_only:
            query += " AND is_bestseller = 1"

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            query += " AND (LOWER(name) LIKE ? OR LOWER(name_te) LIKE ? OR LOWER(description) LIKE ? OR LOWER(size) LIKE ?)"
            params.extend([term, term, term, term])

        if sort == "price_asc":
            query += " ORDER BY price ASC"
        elif sort == "price_desc":
            query += " ORDER BY price DESC"
        elif sort == "rating":
            query += " ORDER BY rating DESC"
        else:
            query += " ORDER BY is_bestseller DESC, id ASC"

        cur.execute(query, params)
        rows = cur.fetchall()
        products = [dict(r) for r in rows]
        return jsonify({"success": True, "count": len(products), "products": products})

@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"detail": "Product not found"}), 404
        product = dict(row)

        cur.execute("SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4", (product["category"], product_id))
        related = [dict(r) for r in cur.fetchall()]
        product["related_products"] = related

        return jsonify({"success": True, "product": product})

@app.route("/api/products", methods=["POST"])
def create_product():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    data = request.get_json(force=True) or {}
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('''
        INSERT INTO products (name, name_te, category, description, description_te, size, pack_size, price, price_per_piece, in_stock, image_url, badge, is_bestseller)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get("name"), data.get("name_te"), data.get("category"), data.get("description", ""), data.get("description_te", ""),
            data.get("size"), int(data.get("pack_size", 25)), float(data.get("price")), float(data.get("price_per_piece")), int(data.get("in_stock", 1)),
            data.get("image_url", "/static/assets/images/round_plate_set.jpg"), data.get("badge", ""), int(data.get("is_bestseller", 0))
        ))
        conn.commit()
        return jsonify({"success": True, "id": cur.lastrowid, "message": "Product created successfully"})

@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    data = request.get_json(force=True) or {}
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('''
        UPDATE products
        SET name = ?, name_te = ?, category = ?, description = ?, description_te = ?, size = ?,
            pack_size = ?, price = ?, price_per_piece = ?, in_stock = ?, image_url = ?, badge = ?, is_bestseller = ?
        WHERE id = ?
        ''', (
            data.get("name"), data.get("name_te"), data.get("category"), data.get("description", ""), data.get("description_te", ""),
            data.get("size"), int(data.get("pack_size", 25)), float(data.get("price")), float(data.get("price_per_piece")), int(data.get("in_stock", 1)),
            data.get("image_url"), data.get("badge", ""), int(data.get("is_bestseller", 0)), product_id
        ))
        conn.commit()
        return jsonify({"success": True, "message": "Product updated successfully"})

@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Product deleted successfully"})

# ----------------- COUPONS ENDPOINTS -----------------

@app.route("/api/coupons/active", methods=["GET"])
def get_active_coupons():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM coupons WHERE is_active = 1 ORDER BY discount_value DESC")
        rows = cur.fetchall()
        return jsonify({"success": True, "coupons": [dict(r) for r in rows]})

@app.route("/api/coupons/validate", methods=["POST"])
def validate_coupon():
    data = request.get_json(force=True) or {}
    code = data.get("code", "").strip().upper()
    subtotal = float(data.get("subtotal", 0.0))
    user = get_current_user()

    if not code:
        return jsonify({"detail": "Coupon code is required"}), 400

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM coupons WHERE code = ? AND is_active = 1", (code,))
        coupon = cur.fetchone()
        if not coupon:
            return jsonify({"detail": "Invalid coupon code. Please check and try again."}), 400

        c = dict(coupon)
        if subtotal < c["min_order"]:
            return jsonify({"detail": f"Coupon requires a minimum order of ₹{int(c['min_order'])}. Add items worth ₹{int(c['min_order'] - subtotal)} more to qualify."}), 400

        if c["times_used"] >= c["usage_limit"]:
            return jsonify({"detail": "Coupon usage limit has been reached."}), 400

        if c["first_order_only"] and user:
            cur.execute("SELECT COUNT(*) as cnt FROM orders WHERE user_id = ?", (user["id"],))
            cnt = cur.fetchone()["cnt"]
            if cnt > 0:
                return jsonify({"detail": "This coupon is valid only for first-time customers."}), 400

        if c["discount_type"] == "percent":
            discount = round((subtotal * c["discount_value"]) / 100.0, 2)
        else:
            discount = round(c["discount_value"], 2)

        if discount > subtotal:
            discount = subtotal

        return jsonify({
            "success": True,
            "code": c["code"],
            "discount": discount,
            "discount_type": c["discount_type"],
            "discount_value": c["discount_value"],
            "message": f"Coupon applied! You saved ₹{discount}"
        })

@app.route("/api/coupons", methods=["GET"])
def get_all_coupons():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM coupons ORDER BY id DESC")
        return jsonify({"success": True, "coupons": [dict(r) for r in cur.fetchall()]})

@app.route("/api/coupons", methods=["POST"])
def create_coupon():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    data = request.get_json(force=True) or {}
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('''
        INSERT INTO coupons (code, description, discount_type, discount_value, min_order, start_date, end_date, usage_limit, first_order_only, category_limit, is_active, show_banner, banner_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get("code", "").strip().upper(), data.get("description", ""), data.get("discount_type", "percent"), float(data.get("discount_value", 10)),
            float(data.get("min_order", 0)), data.get("start_date", "2026-01-01"), data.get("end_date", "2026-12-31"), int(data.get("usage_limit", 1000)),
            int(data.get("first_order_only", 0)), data.get("category_limit", "all"), int(data.get("is_active", 1)), int(data.get("show_banner", 1)), data.get("banner_text", "")
        ))
        conn.commit()
        return jsonify({"success": True, "message": "Coupon created successfully"})

@app.route("/api/coupons/<int:coupon_id>", methods=["PUT"])
def update_coupon(coupon_id):
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    data = request.get_json(force=True) or {}
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('''
        UPDATE coupons
        SET code = ?, description = ?, discount_type = ?, discount_value = ?, min_order = ?,
            start_date = ?, end_date = ?, usage_limit = ?, first_order_only = ?, category_limit = ?,
            is_active = ?, show_banner = ?, banner_text = ?
        WHERE id = ?
        ''', (
            data.get("code", "").strip().upper(), data.get("description", ""), data.get("discount_type", "percent"), float(data.get("discount_value", 10)),
            float(data.get("min_order", 0)), data.get("start_date", "2026-01-01"), data.get("end_date", "2026-12-31"), int(data.get("usage_limit", 1000)),
            int(data.get("first_order_only", 0)), data.get("category_limit", "all"), int(data.get("is_active", 1)), int(data.get("show_banner", 1)), data.get("banner_text", ""),
            coupon_id
        ))
        conn.commit()
        return jsonify({"success": True, "message": "Coupon updated successfully"})

@app.route("/api/coupons/<int:coupon_id>", methods=["DELETE"])
def delete_coupon(coupon_id):
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM coupons WHERE id = ?", (coupon_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Coupon deleted successfully"})

# ----------------- ORDERS ENDPOINTS -----------------

def generate_order_id(conn):
    now = datetime.now()
    prefix = f"SLG-{now.strftime('%y%m')}-"
    cur = conn.cursor()
    cur.execute("SELECT id FROM orders WHERE id LIKE ? ORDER BY id DESC LIMIT 1", (f"{prefix}%",))
    row = cur.fetchone()
    if row:
        last_id = row["id"]
        try:
            num = int(last_id.split("-")[-1]) + 1
        except Exception:
            num = 1
    else:
        num = 1
    return f"{prefix}{num:04d}"

@app.route("/api/orders", methods=["POST"])
def place_order():
    data = request.get_json(force=True) or {}
    items = data.get("items", [])
    if not items:
        return jsonify({"detail": "Cart is empty"}), 400

    user = get_current_user()
    settings = get_all_settings()
    min_order_amt = float(settings.get("min_order_amount", "100"))
    free_deliv_threshold = float(settings.get("free_delivery_threshold", "500"))
    standard_deliv_fee = float(settings.get("delivery_fee", "40"))
    bulk_pct = float(settings.get("bulk_discount_pct", "5"))
    bulk_threshold = float(settings.get("bulk_discount_threshold", "2000"))
    gst_enabled = settings.get("gst_enabled", "0") == "1"
    gst_rate = float(settings.get("gst_rate", "5"))

    with get_db() as conn:
        cur = conn.cursor()
        order_id = generate_order_id(conn)

        subtotal = 0.0
        order_items_data = []
        for it in items:
            cur.execute("SELECT id, name, size, pack_size, price, in_stock FROM products WHERE id = ?", (it.get("id"),))
            p = cur.fetchone()
            if not p:
                return jsonify({"detail": f"Product {it.get('name')} not found"}), 400
            item_price = float(p["price"])
            qty = int(it.get("qty", 1))
            item_total = item_price * qty
            subtotal += item_total
            order_items_data.append({
                "id": p["id"],
                "name": p["name"],
                "size": p["size"],
                "pack": p["pack_size"],
                "price": item_price,
                "qty": qty,
                "total": item_total
            })

        if subtotal < min_order_amt:
            return jsonify({"detail": f"Minimum order amount is ₹{int(min_order_amt)}"}), 400

        bulk_discount = round((subtotal * (bulk_pct / 100.0)), 2) if subtotal >= bulk_threshold else 0.0

        coupon_discount = 0.0
        coupon_code = None
        c_code_input = data.get("coupon_code")
        if c_code_input and c_code_input.strip():
            c_code = c_code_input.strip().upper()
            cur.execute("SELECT * FROM coupons WHERE code = ? AND is_active = 1", (c_code,))
            c_row = cur.fetchone()
            if c_row:
                c = dict(c_row)
                if subtotal >= c["min_order"]:
                    coupon_code = c["code"]
                    if c["discount_type"] == "percent":
                        coupon_discount = round(((subtotal - bulk_discount) * c["discount_value"]) / 100.0, 2)
                    else:
                        coupon_discount = round(c["discount_value"], 2)
                    cur.execute("UPDATE coupons SET times_used = times_used + 1 WHERE id = ?", (c["id"],))

        wallet_credit_used = 0.0
        if data.get("use_wallet") and user and user.get("wallet_balance", 0) > 0:
            available_wallet = float(user["wallet_balance"])
            net_before_wallet = subtotal - bulk_discount - coupon_discount
            wallet_credit_used = min(available_wallet, max(0.0, net_before_wallet - 10.0))
            wallet_credit_used = round(wallet_credit_used, 2)
            cur.execute("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?", (wallet_credit_used, user["id"]))

        effective_items_total = subtotal - bulk_discount - coupon_discount
        delivery_fee = 0.0 if effective_items_total >= free_deliv_threshold else standard_deliv_fee

        gst_amount = 0.0
        if gst_enabled:
            gst_amount = round(((effective_items_total - wallet_credit_used) * (gst_rate / 100.0)), 2)

        final_total = round(max(0.0, effective_items_total - wallet_credit_used + delivery_fee + gst_amount), 2)

        payment_mode = "UPI" if (data.get("payment_mode") or "").upper() == "UPI" else "COD"
        upi_ref = data.get("upi_ref_id")
        payment_status = "Pending" if payment_mode == "COD" else ("Verification Pending" if upi_ref else "Pending")
        order_status = "Placed"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        user_id = user["id"] if user else None

        cur.execute('''
        INSERT INTO orders (
            id, user_id, customer_name, customer_mobile, customer_address, delivery_notes,
            items_json, subtotal, bulk_discount, coupon_code, coupon_discount,
            referral_credit_used, delivery_fee, gst_amount, total_amount, payment_mode,
            payment_status, upi_ref_id, order_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            order_id, user_id, data.get("customer_name", "").strip(), data.get("customer_mobile", "").strip(),
            data.get("customer_address", "").strip(), data.get("delivery_notes", "") or "",
            json.dumps(order_items_data), subtotal, bulk_discount, coupon_code, coupon_discount,
            wallet_credit_used, delivery_fee, gst_amount, final_total, payment_mode,
            payment_status, upi_ref, order_status, now_str, now_str
        ))

        items_summary_lines = []
        for it in order_items_data:
            items_summary_lines.append(f"• {it['name']} x {it['qty']} pack ({it['size']}) = ₹{it['total']}")
        items_text = "\n".join(items_summary_lines)

        owner_mobile = settings.get("owner_mobile", "9642677869")
        notification_title = f"New Order: {order_id}"
        notification_msg = (
            f"🌿 NEW ORDER RECEIVED!\n"
            f"Order ID: {order_id}\n"
            f"Customer: {data.get('customer_name')} ({data.get('customer_mobile')})\n"
            f"Delivery Address: {data.get('customer_address')}\n"
            f"Notes: {data.get('delivery_notes') or 'None'}\n"
            f"\nItems:\n{items_text}\n\n"
            f"Subtotal: ₹{subtotal}\n"
            f"Discount: ₹{bulk_discount + coupon_discount + wallet_credit_used}\n"
            f"Delivery Fee: ₹{delivery_fee}\n"
            f"Total Amount: ₹{final_total}\n"
            f"Payment: {payment_mode} ({payment_status})\n"
            f"Status: Placed"
        )

        cur.execute('''
        INSERT INTO notifications (type, title, message, target, target_id, data_json, created_at)
        VALUES ('order_placed', ?, ?, 'owner', '1', ?, ?)
        ''', (
            notification_title,
            notification_msg,
            json.dumps({"order_id": order_id, "amount": final_total, "mobile": data.get("customer_mobile")}),
            now_str
        ))

        conn.commit()

        encoded_msg = urllib.parse.quote(notification_msg)
        owner_wa_link = f"https://api.whatsapp.com/send?phone=91{owner_mobile}&text={encoded_msg}"
        cust_wa_link = f"https://api.whatsapp.com/send?phone=91{data.get('customer_mobile')}&text={urllib.parse.quote('Thank you for ordering with Sri Lakshmi Ganapathi! Your order ' + order_id + ' of ₹' + str(final_total) + ' has been placed successfully.')}"

        return jsonify({
            "success": True,
            "order_id": order_id,
            "total_amount": final_total,
            "payment_mode": payment_mode,
            "payment_status": payment_status,
            "order_status": order_status,
            "owner_whatsapp_url": owner_wa_link,
            "customer_whatsapp_url": cust_wa_link,
            "message": "Order placed successfully! Expected delivery in Eluru within 2-4 hours."
        })

@app.route("/api/orders/my-orders", methods=["GET"])
def get_my_orders():
    user = get_current_user()
    if not user:
        return jsonify({"detail": "Authentication required"}), 401
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders WHERE user_id = ? OR customer_mobile = ? ORDER BY created_at DESC", (user["id"], user["mobile"]))
        rows = cur.fetchall()
        orders = []
        for r in rows:
            o = dict(r)
            try:
                o["items"] = json.loads(o["items_json"])
            except Exception:
                o["items"] = []
            orders.append(o)
        return jsonify({"success": True, "orders": orders})

@app.route("/api/orders/<order_id>", methods=["GET"])
def get_order_by_id(order_id):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"detail": "Order not found"}), 404
        order = dict(row)
        try:
            order["items"] = json.loads(order["items_json"])
        except Exception:
            order["items"] = []
        return jsonify({"success": True, "order": order})

@app.route("/api/orders/<order_id>/cancel", methods=["POST"])
def cancel_order(order_id):
    user = get_current_user()
    if not user:
        return jsonify({"detail": "Authentication required"}), 401
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"detail": "Order not found"}), 404
        order = dict(row)
        if order["order_status"] != "Placed":
            return jsonify({"detail": f"Cannot cancel order once it is {order['order_status']}"}), 400

        cur.execute("UPDATE orders SET order_status = 'Cancelled', updated_at = ? WHERE id = ?", (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), order_id))
        if order.get("referral_credit_used", 0) > 0 and order.get("user_id"):
            cur.execute("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", (order["referral_credit_used"], order["user_id"]))
        conn.commit()
        return jsonify({"success": True, "message": "Order cancelled successfully"})

@app.route("/api/orders/<order_id>/submit-upi", methods=["POST"])
def submit_upi_reference(order_id):
    data = request.get_json(force=True) or {}
    upi_ref = data.get("upi_ref_id", "").strip()
    if not upi_ref or len(upi_ref) < 8:
        return jsonify({"detail": "Please enter a valid 12-digit UPI Transaction ID / UTR"}), 400

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"detail": "Order not found"}), 404

        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cur.execute('''
        UPDATE orders SET upi_ref_id = ?, payment_status = 'Verification Pending', updated_at = ? WHERE id = ?
        ''', (upi_ref, now_str, order_id))

        cur.execute('''
        INSERT INTO notifications (type, title, message, target, target_id, data_json, created_at)
        VALUES ('payment_submitted', 'UPI Payment Submitted', ?, 'owner', '1', ?, ?)
        ''', (
            f"Customer submitted UPI UTR {upi_ref} for order {order_id}",
            json.dumps({"order_id": order_id, "upi_ref": upi_ref}),
            now_str
        ))
        conn.commit()
        return jsonify({"success": True, "message": "UPI Transaction ID submitted. Verification pending with owner."})

# ----------------- OWNER DASHBOARD API -----------------

@app.route("/api/owner/overview", methods=["GET"])
def get_owner_overview():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403

    with get_db() as conn:
        cur = conn.cursor()
        today_str = datetime.now().strftime("%Y-%m-%d")

        cur.execute("SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total FROM orders WHERE created_at LIKE ? AND order_status != 'Cancelled'", (f"{today_str}%",))
        today_row = cur.fetchone()
        today_count = today_row["count"]
        today_revenue = round(today_row["total"], 2)

        cur.execute("SELECT COUNT(*) as count FROM orders WHERE order_status IN ('Placed', 'Confirmed', 'Packed', 'Out for Delivery')")
        to_be_delivered = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Delivered' AND updated_at LIKE ?", (f"{today_str}%",))
        delivered_today = cur.fetchone()["count"]

        month_str = datetime.now().strftime("%Y-%m")
        cur.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE created_at LIKE ? AND order_status = 'Delivered'", (f"{month_str}%",))
        this_month_earnings = round(cur.fetchone()["total"], 2)

        cur.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE order_status = 'Delivered'")
        lifetime_earnings = round(cur.fetchone()["total"], 2)

        cur.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_mode = 'COD' AND order_status IN ('Placed', 'Confirmed', 'Packed', 'Out for Delivery')")
        cod_to_collect = round(cur.fetchone()["total"], 2)

        cur.execute("SELECT COUNT(*) as count FROM orders WHERE payment_mode = 'UPI' AND payment_status = 'Verification Pending'")
        upi_pending_count = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) as count FROM notifications WHERE target = 'owner' AND is_read = 0")
        unread_notifications = cur.fetchone()["count"]

        return jsonify({
            "success": True,
            "metrics": {
                "today_orders_count": today_count,
                "today_orders_value": today_revenue,
                "to_be_delivered": to_be_delivered,
                "delivered_today": delivered_today,
                "today_earnings": today_revenue,
                "this_month_earnings": this_month_earnings,
                "lifetime_earnings": lifetime_earnings,
                "cod_to_collect": cod_to_collect,
                "upi_pending_verification": upi_pending_count,
                "unread_notifications": unread_notifications
            }
        })

@app.route("/api/owner/charts", methods=["GET"])
def get_owner_charts():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403

    with get_db() as conn:
        cur = conn.cursor()
        today = datetime.now()

        daily_labels = []
        daily_values = []
        for i in range(29, -1, -1):
            d = today - timedelta(days=i)
            d_str = d.strftime("%Y-%m-%d")
            label = d.strftime("%d %b")
            cur.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE created_at LIKE ? AND order_status != 'Cancelled'", (f"{d_str}%",))
            amt = round(cur.fetchone()["total"], 2)
            daily_labels.append(label)
            daily_values.append(amt)

        cur.execute("SELECT items_json FROM orders WHERE order_status != 'Cancelled'")
        rows = cur.fetchall()
        product_sales = {}
        for r in rows:
            try:
                items = json.loads(r["items_json"])
                for it in items:
                    name = it.get("name", "Product")
                    qty = it.get("qty", 1)
                    product_sales[name] = product_sales.get(name, 0) + qty
            except Exception:
                pass

        sorted_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]
        top_product_labels = [p[0] for p in sorted_products]
        top_product_values = [p[1] for p in sorted_products]

        return jsonify({
            "success": True,
            "daily_earnings": {"labels": daily_labels, "values": daily_values},
            "top_products": {"labels": top_product_labels, "values": top_product_values}
        })

@app.route("/api/owner/orders", methods=["GET"])
def get_owner_orders():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403

    filter_type = request.args.get("filter_type", "all")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    search = request.args.get("search")

    with get_db() as conn:
        cur = conn.cursor()
        query = "SELECT * FROM orders WHERE 1=1"
        params = []

        today_str = datetime.now().strftime("%Y-%m-%d")
        if filter_type == "today":
            query += " AND created_at LIKE ?"
            params.append(f"{today_str}%")
        elif filter_type == "pending":
            query += " AND order_status IN ('Placed', 'Confirmed', 'Packed', 'Out for Delivery')"
        elif filter_type == "delivered":
            query += " AND order_status = 'Delivered'"
        elif filter_type == "cancelled":
            query += " AND order_status = 'Cancelled'"

        if date_from:
            query += " AND created_at >= ?"
            params.append(f"{date_from} 00:00:00")
        if date_to:
            query += " AND created_at <= ?"
            params.append(f"{date_to} 23:59:59")

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            query += " AND (LOWER(id) LIKE ? OR LOWER(customer_name) LIKE ? OR customer_mobile LIKE ? OR upi_ref_id LIKE ?)"
            params.extend([term, term, term, term])

        query += " ORDER BY created_at DESC"
        cur.execute(query, params)
        rows = cur.fetchall()

        orders = []
        for r in rows:
            o = dict(r)
            try:
                o["items"] = json.loads(o["items_json"])
            except Exception:
                o["items"] = []
            orders.append(o)

        return jsonify({"success": True, "count": len(orders), "orders": orders})

@app.route("/api/owner/orders/<order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403

    data = request.get_json(force=True) or {}
    new_status = data.get("status")
    valid_statuses = ["Placed", "Confirmed", "Packed", "Out for Delivery", "Delivered", "Cancelled"]
    if new_status not in valid_statuses:
        return jsonify({"detail": "Invalid status"}), 400

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order = cur.fetchone()
        if not order:
            return jsonify({"detail": "Order not found"}), 404

        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cur.execute("UPDATE orders SET order_status = ?, updated_at = ? WHERE id = ?", (new_status, now_str, order_id))

        if new_status == "Delivered" and order["payment_mode"] == "COD":
            cur.execute("UPDATE orders SET payment_status = 'Received' WHERE id = ?", (order_id,))

        # CUSTOMER STATUS NOTIFICATION:
        if order["user_id"]:
            cur.execute('''
            INSERT INTO notifications (type, title, message, target, target_id, data_json, created_at)
            VALUES ('order_status', ?, ?, 'customer', ?, ?, ?)
            ''', (
                f"Order #{order_id} is now {new_status}!",
                f"Your Sri Lakshmi Ganapathi order #{order_id} status changed to '{new_status}'.",
                str(order["user_id"]),
                json.dumps({"order_id": order_id, "status": new_status}),
                now_str
            ))

        # REFERRAL REWARD TRIGGER:
        if new_status == "Delivered" and order["user_id"]:
            user_id = order["user_id"]
            cur.execute("SELECT * FROM referrals WHERE referred_user_id = ? AND status = 'pending'", (user_id,))
            ref_record = cur.fetchone()
            if ref_record:
                referrer_id = ref_record["referrer_user_id"]
                reward_amt = float(ref_record["referrer_reward"])
                cur.execute("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", (reward_amt, referrer_id))
                cur.execute("UPDATE referrals SET status = 'completed', order_id = ?, completed_at = ? WHERE id = ?", (order_id, now_str, ref_record["id"]))
                cur.execute('''
                INSERT INTO notifications (type, title, message, target, target_id, data_json, created_at)
                VALUES ('referral_reward', 'Referral Reward Credited', ?, 'customer', ?, ?, ?)
                ''', (
                    f"Congratulations! Your referral reward of ₹{reward_amt} has been credited to your wallet for order {order_id}.",
                    str(referrer_id),
                    json.dumps({"reward": reward_amt, "order_id": order_id}),
                    now_str
                ))

        conn.commit()

        wa_text = f"Hello {order['customer_name']}, your Sri Lakshmi Ganapathi order {order_id} status is now: *{new_status}*."
        customer_wa = f"https://api.whatsapp.com/send?phone=91{order['customer_mobile']}&text={urllib.parse.quote(wa_text)}"

        return jsonify({
            "success": True,
            "message": f"Order status updated to {new_status}",
            "customer_whatsapp_url": customer_wa
        })

@app.route("/api/owner/orders/<order_id>/verify-payment", methods=["PUT"])
def verify_order_payment(order_id):
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403

    data = request.get_json(force=True) or {}
    payment_status = data.get("payment_status", "Verified")
    upi_ref_id = data.get("upi_ref_id")

    with get_db() as conn:
        cur = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if upi_ref_id:
            cur.execute("UPDATE orders SET payment_status = ?, upi_ref_id = ?, updated_at = ? WHERE id = ?", (payment_status, upi_ref_id, now_str, order_id))
        else:
            cur.execute("UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?", (payment_status, now_str, order_id))
        conn.commit()
        return jsonify({"success": True, "message": f"Payment status updated to {payment_status}"})

@app.route("/api/owner/orders/<order_id>/invoice", methods=["GET"])
def get_order_invoice(order_id):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"detail": "Order not found"}), 404
        order = dict(row)
        try:
            order["items"] = json.loads(order["items_json"])
        except Exception:
            order["items"] = []

        settings = get_all_settings()
        return jsonify({
            "success": True,
            "order": order,
            "business": {
                "name": settings.get("business_name", "Sri Lakshmi Ganapathi - Areca Plates"),
                "tagline": settings.get("business_tagline", "Sustainable. Natural. Pure."),
                "address": settings.get("business_address", "8-176, Block 3, Sunkaravaari Thota, Madhepalli Road, Eluru, AP 534001"),
                "phones": settings.get("business_phones", "9849052800, 9642677869"),
                "upi_id": settings.get("upi_id", "anandmajji141@axl"),
                "gstin": "37AAAPL1234F1Z8"
            }
        })

@app.route("/api/owner/export-orders", methods=["GET"])
def export_orders_csv():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403

    filter_type = request.args.get("filter_type", "all")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    with get_db() as conn:
        cur = conn.cursor()
        query = "SELECT * FROM orders WHERE 1=1"
        params = []
        if filter_type == "today":
            today_str = datetime.now().strftime("%Y-%m-%d")
            query += " AND created_at LIKE ?"
            params.append(f"{today_str}%")
        elif filter_type == "pending":
            query += " AND order_status IN ('Placed', 'Confirmed', 'Packed', 'Out for Delivery')"
        elif filter_type == "delivered":
            query += " AND order_status = 'Delivered'"

        if date_from:
            query += " AND created_at >= ?"
            params.append(f"{date_from} 00:00:00")
        if date_to:
            query += " AND created_at <= ?"
            params.append(f"{date_to} 23:59:59")

        query += " ORDER BY created_at DESC"
        cur.execute(query, params)
        rows = cur.fetchall()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Order ID", "Date", "Customer Name", "Mobile", "Address",
            "Items Summary", "Subtotal (INR)", "Bulk Discount", "Coupon Discount",
            "Delivery Fee", "Total Amount (INR)", "Payment Mode", "Payment Status",
            "UPI Reference UTR", "Order Status"
        ])

        for r in rows:
            try:
                items = json.loads(r["items_json"])
                items_str = "; ".join([f"{it['name']} x {it['qty']} ({it['size']})" for it in items])
            except Exception:
                items_str = ""

            writer.writerow([
                r["id"], r["created_at"], r["customer_name"], r["customer_mobile"], r["customer_address"],
                items_str, r["subtotal"], r["bulk_discount"], r["coupon_discount"],
                r["delivery_fee"], r["total_amount"], r["payment_mode"], r["payment_status"],
                r["upi_ref_id"] or "", r["order_status"]
            ])

        output.seek(0)
        filename = f"SLG_Orders_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return Response(
            output.getvalue().encode("utf-8-sig"),
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

@app.route("/api/owner/customers", methods=["GET"])
def get_customers():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('''
        SELECT u.id, u.username, u.full_name, u.mobile, u.email, u.referral_code, u.wallet_balance, u.created_at,
               COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id AND o.order_status != 'Cancelled'
        WHERE u.role = 'customer'
        GROUP BY u.id
        ORDER BY total_spent DESC, order_count DESC
        ''')
        customers = [dict(r) for r in cur.fetchall()]
        return jsonify({"success": True, "customers": customers})

@app.route("/api/owner/referrals", methods=["GET"])
def get_referrals():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('''
        SELECT r.id, r.referrer_user_id, r.referred_user_id, r.referrer_reward, r.friend_reward, r.status, r.order_id, r.created_at, r.completed_at,
               u1.full_name as referrer_name, u1.mobile as referrer_mobile, u1.referral_code,
               u2.full_name as friend_name, u2.mobile as friend_mobile
        FROM referrals r
        JOIN users u1 ON r.referrer_user_id = u1.id
        JOIN users u2 ON r.referred_user_id = u2.id
        ORDER BY r.created_at DESC
        ''')
        referrals = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT COUNT(*) as total_count, COALESCE(SUM(CASE WHEN status='completed' THEN referrer_reward ELSE 0 END), 0) as total_paid FROM referrals")
        summary = dict(cur.fetchone())
        settings = get_all_settings()

        return jsonify({
            "success": True,
            "referrals": referrals,
            "summary": summary,
            "settings": {
                "referrer_reward": float(settings.get("referrer_reward_amt", "100")),
                "friend_reward": float(settings.get("friend_reward_amt", "50"))
            }
        })

@app.route("/api/owner/referrals/settings", methods=["PUT"])
def update_referral_settings():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    data = request.get_json(force=True) or {}
    ref_amt = str(data.get("referrer_reward_amt", 100))
    friend_amt = str(data.get("friend_reward_amt", 50))
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('referrer_reward_amt', ?)", (ref_amt,))
        cur.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('friend_reward_amt', ?)", (friend_amt,))
        conn.commit()
    return jsonify({"success": True, "message": "Referral reward amounts updated successfully"})

@app.route("/api/owner/notifications", methods=["GET"])
def get_notifications():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM notifications WHERE target = 'owner' ORDER BY created_at DESC LIMIT 30")
        rows = [dict(r) for r in cur.fetchall()]
        return jsonify({"success": True, "notifications": rows})

@app.route("/api/owner/notifications/mark-read", methods=["POST"])
def mark_notifications_read():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("UPDATE notifications SET is_read = 1 WHERE target = 'owner'")
        conn.commit()
    return jsonify({"success": True, "message": "All notifications marked as read"})

@app.route("/api/customer/notifications", methods=["GET"])
def get_customer_notifications():
    user = get_current_user()
    if not user:
        return jsonify({"success": True, "notifications": []})
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM notifications WHERE target = 'customer' AND target_id = ? ORDER BY created_at DESC LIMIT 20", (str(user["id"]),))
        rows = [dict(r) for r in cur.fetchall()]
        return jsonify({"success": True, "notifications": rows})

# ----------------- ENQUIRIES ENDPOINTS -----------------

@app.route("/api/enquiries", methods=["POST"])
def submit_enquiry():
    data = request.get_json(force=True) or {}
    name = data.get("name", "").strip()
    mobile = data.get("mobile", "").strip()
    event_type = data.get("event_type", "")
    event_date = data.get("event_date", "")
    quantity = data.get("quantity", "")
    message = data.get("message", "")

    with get_db() as conn:
        cur = conn.cursor()
        now_str = datetime.now().isoformat()
        cur.execute('''
        INSERT INTO enquiries (name, mobile, event_type, event_date, quantity, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'New', ?)
        ''', (name, mobile, event_type, event_date, quantity, message, now_str))
        enquiry_id = cur.lastrowid

        cur.execute('''
        INSERT INTO notifications (type, title, message, target, target_id, data_json, created_at)
        VALUES ('enquiry', 'New Bulk Order Enquiry', ?, 'owner', '1', ?, ?)
        ''', (
            f"Enquiry from {name} ({mobile}) for {event_type} on {event_date} ({quantity} plates)",
            json.dumps({"enquiry_id": enquiry_id, "name": name, "mobile": mobile}),
            now_str
        ))
        conn.commit()

        owner_mobile = get_setting("owner_mobile", "9642677869")
        msg = f"🌿 New Bulk Enquiry: {name} ({mobile}) for {event_type} on {event_date}. Quantity: {quantity}. Note: {message}"
        wa_url = f"https://api.whatsapp.com/send?phone=91{owner_mobile}&text={urllib.parse.quote(msg)}"

        return jsonify({
            "success": True,
            "message": "Enquiry received! Sri Lakshmi Ganapathi will contact you shortly.",
            "owner_whatsapp_url": wa_url
        })

@app.route("/api/owner/enquiries", methods=["GET"])
def get_enquiries():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM enquiries ORDER BY created_at DESC")
        return jsonify({"success": True, "enquiries": [dict(r) for r in cur.fetchall()]})

@app.route("/api/owner/enquiries/<int:enquiry_id>/status", methods=["PUT"])
def update_enquiry_status(enquiry_id):
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    data = request.get_json(force=True) or {}
    status = data.get("status", "Contacted")
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("UPDATE enquiries SET status = ? WHERE id = ?", (status, enquiry_id))
        conn.commit()
    return jsonify({"success": True, "message": "Enquiry status updated"})

# ----------------- SETTINGS ENDPOINTS -----------------

@app.route("/api/settings", methods=["GET"])
def get_public_settings():
    s = get_all_settings()
    return jsonify({
        "success": True,
        "settings": {
            "business_name": s.get("business_name", "SRI LAKSHMI GANAPATHI - ARECA PLATES MANUFACTURERS"),
            "business_tagline": s.get("business_tagline", "Sustainable. Natural. Pure."),
            "business_address": s.get("business_address", "8-176, Block 3, Sunkaravaari Thota, Madhepalli Road, Eluru, Eluru District, Andhra Pradesh 534001"),
            "business_phones": s.get("business_phones", "9849052800, 9642677869, 9346326432, 8309729149"),
            "owner_mobile": s.get("owner_mobile", "9642677869"),
            "opening_hours": s.get("opening_hours", "7:30 AM - 9:00 PM (Monday - Sunday)"),
            "delivery_fee": float(s.get("delivery_fee", "40")),
            "free_delivery_threshold": float(s.get("free_delivery_threshold", "500")),
            "min_order_amount": float(s.get("min_order_amount", "100")),
            "bulk_discount_pct": float(s.get("bulk_discount_pct", "5")),
            "bulk_discount_threshold": float(s.get("bulk_discount_threshold", "2000")),
            "gst_enabled": s.get("gst_enabled", "0") == "1",
            "gst_rate": float(s.get("gst_rate", "5")),
            "upi_id": s.get("upi_id", "anandmajji141@axl")
        }
    })

@app.route("/api/owner/settings", methods=["PUT"])
def update_settings():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    data = request.get_json(force=True) or {}
    settings_dict = data.get("settings", {})
    with get_db() as conn:
        cur = conn.cursor()
        for k, v in settings_dict.items():
            cur.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, str(v)))
        conn.commit()
    return jsonify({"success": True, "message": "Settings updated successfully"})

@app.route("/api/owner/change-password", methods=["POST"])
def change_owner_password():
    user = get_current_user()
    if not user or user.get("role") != "owner":
        return jsonify({"detail": "Owner access required"}), 403
    data = request.get_json(force=True) or {}
    current_pw = data.get("current_password", "")
    new_pw = data.get("new_password", "")

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT password_hash FROM users WHERE id = ?", (user["id"],))
        u = cur.fetchone()
        if not check_password_hash(u["password_hash"], current_pw):
            return jsonify({"detail": "Current password is incorrect"}), 400

        if len(new_pw) < 8:
            return jsonify({"detail": "New password must be at least 8 characters"}), 400

        new_hash = generate_password_hash(new_pw)
        cur.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user["id"]))
        conn.commit()
    return jsonify({"success": True, "message": "Owner password changed successfully"})

# ----------------- DYNAMIC UPI QR CODE -----------------

@app.route("/api/upi/qr", methods=["GET"])
def generate_upi_qr():
    amount = float(request.args.get("amount", 0.0))
    order_id = request.args.get("order_id", "SLG-PAY")
    upi_id = get_setting("upi_id", "anandmajji141@axl")
    merchant_name = "Sri Lakshmi Ganapathi"
    encoded_name = urllib.parse.quote(merchant_name)
    upi_url = f"upi://pay?pa={upi_id}&pn={encoded_name}&am={amount:.2f}&cu=INR&tn={order_id}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(upi_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#1F6B3A", back_color="#FAF8F2")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return send_file(buf, mimetype="image/png")

# ----------------- AI SUPPORT CHATBOT & PUBLIC TRACKING -----------------

@app.route("/api/orders/track/<order_id>", methods=["GET"])
def track_order_public(order_id):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders WHERE id = ? OR upi_ref_id = ?", (order_id.strip(), order_id.strip()))
        row = cur.fetchone()
        if not row:
            return jsonify({"detail": "Order not found"}), 404
        o = dict(row)
        try:
            o["items"] = json.loads(o["items_json"])
        except Exception:
            o["items"] = []
        return jsonify({"success": True, "order": o})

@app.route("/api/support/chat", methods=["POST"])
def support_chat():
    data = request.get_json(force=True) or {}
    user_msg = (data.get("message") or "").strip()
    language = data.get("language", "en")
    user = get_current_user()

    msg_lower = user_msg.lower()
    reply = ""
    quick_replies = []
    order_data = None

    # Check order tracking intent
    if any(k in msg_lower for k in ["track", "order", "status", "where is", "delivery status", "ఆర్డర్", "స్టేటస్", "slg-"]):
        # Extract order ID if in message
        import re
        order_match = re.search(r"SLG-\d{4}-\d{4}", user_msg.upper())
        target_order_id = order_match.group(0) if order_match else None

        with get_db() as conn:
            cur = conn.cursor()
            if target_order_id:
                cur.execute("SELECT * FROM orders WHERE id = ?", (target_order_id,))
                row = cur.fetchone()
            elif user:
                cur.execute("SELECT * FROM orders WHERE user_id = ? OR customer_mobile = ? ORDER BY created_at DESC LIMIT 1", (user["id"], user["mobile"]))
                row = cur.fetchone()
            else:
                row = None

            if row:
                o = dict(row)
                try:
                    o["items"] = json.loads(o["items_json"])
                except Exception:
                    o["items"] = []
                order_data = o
                items_desc = ", ".join([f"{it['name']} x {it['qty']}" for it in o["items"][:2]])
                if len(o["items"]) > 2:
                    items_desc += f" +{len(o['items'])-2} more"

                if language == 'te':
                    reply = f"నమస్తే! మీ ఆర్డర్ #{o['id']} ప్రస్తుతం '{o['order_status']}' స్థితిలో ఉంది.\n\n📦 వస్తువులు: {items_desc}\n💰 మొత్తం: ₹{o['total_amount']} ({o['payment_mode']})\n📍 డెలివరీ: {o['customer_address']}\n\nమా ఎలూరు మాధేపల్లి రోడ్ ఫ్యాక్టరీ నుండి త్వరలోనే సురక్షితంగా డెలివరీ చేయబడుతుంది."
                else:
                    reply = f"Hello! Your order #{o['id']} is currently '{o['order_status']}'.\n\n📦 Items: {items_desc}\n💰 Total: ₹{o['total_amount']} ({o['payment_mode']})\n📍 Delivery Location: {o['customer_address']}\n\nOur team is ensuring safe, hygienic packing and prompt delivery from our Madhepalli Road unit."
            else:
                if user:
                    if language == 'te':
                        reply = "మీ ఖాతాలో ఇప్పటివరకు ఎలాంటి ఆర్డర్లు లేవు. మా సహజసిద్ధమైన అరెకా ఆకు ప్లేట్లను షాపులో బ్రౌజ్ చేయండి!"
                    else:
                        reply = "You don't have any active orders right now. Browse our 100% natural areca palm leaf plates in the shop!"
                else:
                    if language == 'te':
                        reply = "మీ ఆర్డర్ స్థితిని తెలుసుకోవడానికి దయచేసి లాగిన్ అవ్వండి లేదా మీ ఆర్డర్ ఐడీ (ఉదా: SLG-2611-0001) ఇక్కడ టైప్ చేయండి."
                    else:
                        reply = "Please log in to your account to view your live orders, or enter your Order ID (e.g. SLG-2611-0001) to track directly."

        quick_replies = ["View My Orders", "Delivery areas in Eluru", "Talk to Owner"]

    # Check wedding / bulk catering intent
    elif any(k in msg_lower for k in ["wedding", "500", "1000", "cater", "bulk", "event", "combo", "function", "పెళ్లి", "ఫంక్షన్", "బల్క్"]):
        if language == 'te':
            reply = "వివాహాలు, శుభకార్యాలు మరియు క్యాటరింగ్ కోసం మా వద్ద ప్రత్యేక కాంబో ప్యాక్‌లు మరియు బల్క్ డిస్కౌంట్లు ఉన్నాయి!\n\n🍽️ 500 మంది అతిథుల కోసం సిఫార్సు:\n• 500 x 10 అంగుళాల డిన్నర్ ప్లేట్లు\n• 1,000 x 4 అంగుళాల బౌల్స్ (సాంబార్, కూరలు, స్వీట్ కోసం)\n• 500 చెక్క కట్లరీ సెట్లు\n\n💡 ప్రయోజనాలు:\n• వెడ్డింగ్ గ్రాండ్ కాంబో: ₹1,600 (100 మందికి - ₹320 ఆదా!)\n• ₹2,000 పైబడిన ఆర్డర్లపై ఆటోమేటిక్ 5% బల్క్ డిస్కౌంట్ వర్తిస్తుంది!\n\nమరింత సమాచారం కోసం బల్క్ ఎంక్వైరీ ఫారమ్ నింపండి లేదా యజమాని ఆనంద్ మజ్జి గారిని సంప్రదించండి."
        else:
            reply = "We specialize in catering & grand events like weddings, birthdays, and puja functions!\n\n🍽️ Catering Recommendation for 500 Guests:\n• 500 x 10\" Round Heavy Dinner Plates\n• 1,000 x 4\" Bowls (for sambar, curries, sweet/payasam)\n• 500 Natural Birchwood Cutlery Sets\n\n💡 Smart Combos Available:\n• Party Combo: ₹800 (50 guests)\n• Wedding Grand Combo: ₹1,600 (100 guests - Save ₹320!)\n• Automatic 5% Flat Bulk Discount on orders above ₹2,000!\n\nWould you like to submit an event enquiry or chat with Owner Anand Majji directly?"
        quick_replies = ["Bulk Enquiry Form", "View Combos in Shop", "WhatsApp Owner"]

    # Check heat/sambar/leak-proof/chemical-free intent
    elif any(k in msg_lower for k in ["leak", "hot", "sambar", "curry", "water", "chemical", "microwave", "safe", "plastic", "ఆకు", "సాంబార్", "నాణ్యత"]):
        if language == 'te':
            reply = "మా శ్రీ లక్ష్మీ గణపతి అరెకా ప్లేట్లు 100% సహజసిద్ధమైన తాటాకులతో (సుపారీ ఆకులు) తయారు చేయబడ్డాయి:\n\n🌿 ఎటువంటి రసాయనాలు, ప్లాస్టిక్ లేదా మైనం (wax) వాడబడవు.\n🔥 వేడి సాంబార్, రసం, నూనె పదార్ధాలు పోసినా మెత్తబడవు లేదా లీక్ కావు.\n♨️ మైక్రోవేవ్‌లో 2 నిమిషాల వరకు వేడి చేసుకోవచ్చు మరియు ఫ్రిజ్/డీప్‌ఫ్రీజర్‌లో నిల్వ చేయవచ్చు.\n🌱 వాడిన తర్వాత కేవలం 60-90 రోజుల్లో సహజ ఎరువుగా మారిపోతాయి."
        else:
            reply = "Sri Lakshmi Ganapathi areca plates are 100% natural, steam-pressed from naturally fallen palm fronds:\n\n🌿 Zero Chemicals & Zero Plastics: No synthetic coatings, glue, or wax.\n🔥 Boiling Hot & Liquid Proof: Sturdy enough to hold boiling hot sambar, rasam, biryani, and heavy gravies without getting soggy or leaking.\n♨️ Microwave & Freezer Safe: Safe for reheating up to 2 minutes in the microwave and freezer safe.\n🌱 100% Backyard Compostable: Naturally degrades into rich organic compost in 60 to 90 days."
        quick_replies = ["Browse All Plates", "Plates for 500 guests", "Track my order"]

    # Check delivery charges & timing intent
    elif any(k in msg_lower for k in ["delivery", "charge", "eluru", "timing", "free delivery", "డెలివరీ", "చార్జీలు", "ఎలూరు"]):
        if language == 'te':
            reply = "🚚 డెలివరీ వివరాలు:\n• ఎలూరు నగరంలో ₹500 పైబడిన ఆర్డర్లపై డెలివరీ పూర్తిగా ఉచితం (FREE)!\n• ₹500 కంటే తక్కువ ఆర్డర్లపై సాధారణ ఛార్జీ ₹40 మాత్రమే.\n• డెలివరీ సమయం: సాధారణంగా 2 నుండి 4 గంటల్లో మీ ఇంటి వద్దకే చేరుతుంది.\n• కవరింగ్ ఏరియాలు: మాధేపల్లి రోడ్, సుంకరవారి తోట, తంగెళ్ళమూడి, శనివారపుపేట, వట్లూరు, పవర్‌పేట్, ఆర్.ఆర్. పేట్, ఫైర్ స్టేషన్ సెంటర్, అశోక్ నగర్ మరియు పరిసర మండలాలు."
        else:
            reply = "🚚 Delivery Information:\n• FREE Doorstep Delivery within Eluru on all orders above ₹500!\n• For orders under ₹500, nominal delivery fee is only ₹40.\n• Typical delivery time: Within 2 to 4 hours in Eluru.\n• Areas covered: Madhepalli Road, Sunkaravaari Thota, Tangellamudi, Sanivarapupeta, Vatluru, Powerpet, R.R. Pet, Fire Station Center, Ashok Nagar, and surrounding mandals."
        quick_replies = ["Delivery Safe Instructions", "Track my order", "Payment options"]

    # Check payment & UPI intent
    elif any(k in msg_lower for k in ["payment", "upi", "cod", "cash", "gpay", "phonepe", "paytm", "పేమెంట్", "యూపీఐ"]):
        if language == 'te':
            reply = "💳 చెల్లింపు పద్ధతులు:\n1. క్యాష్ ఆన్ డెలివరీ (COD) - డెలివరీ సమయంలో నగదు చెల్లించవచ్చు (అత్యంత సులభం!).\n2. ఆన్‌లైన్ UPI - మా అధికారిక UPI ఐడీకి మాత్రమే: anandmajji141@axl (Google Pay, PhonePe, Paytm, BHIM ద్వారా స్కాన్ చేసి చెల్లించవచ్చు)."
        else:
            reply = "💳 Safe & Reliable Payment Options:\n1. Cash on Delivery (COD): Pay cash when plates are delivered to your door (Recommended).\n2. Online via UPI: Pay securely to our official factory UPI ID: anandmajji141@axl using Google Pay, PhonePe, Paytm, or BHIM.\n\nAfter UPI payment, simply enter your 12-digit transaction UTR for instant verification."
        quick_replies = ["Payment Options", "Shop Now", "Talk to Owner"]

    # Check human / owner escalation
    elif any(k in msg_lower for k in ["owner", "anand", "majji", "call", "human", "phone", "contact", "support", "నెంబర్", "ఫోన్", "మాట్లాడాలి"]):
        if language == 'te':
            reply = "శ్రీ లక్ష్మీ గణపతి యజమానితో నేరుగా మాట్లాడండి:\n\n👑 యజమాని: ఆనంద్ మజ్జి (Anand Majji)\n📱 మొబైల్ / వాట్సాప్: 9642677869\n📞 ఫ్యాక్టరీ లైన్: 9849052800\n📍 చిరునామా: 8-176, బ్లాక్ 3, సుంకరవారి తోట, మాధేపల్లి రోడ్, ఎలూరు - 534001\n\nవాట్సాప్‌లో మెసేజ్ చేయడానికి లేదా కాల్ చేయడానికి కింద బటన్లు ఉపయోగించండి!"
        else:
            reply = "Connect directly with the business owner:\n\n👑 Owner: Anand Majji\n📱 Mobile / WhatsApp: +91 9642677869\n📞 Factory Hotline: +91 9849052800\n📍 Factory Address: 8-176, Block 3, Sunkaravaari Thota, Madhepalli Road, Eluru - 534001\n\nClick the WhatsApp button below to start a direct chat with Anand Majji!"
        quick_replies = ["WhatsApp Owner", "Call 9642677869", "Factory Directions"]

    # Default friendly assistant greeting
    else:
        if language == 'te':
            reply = "నమస్తే! 🙏 నేను శ్రీ లక్ష్మీ గణపతి AI సహాయకుడిని. అరెకా ఆకు ప్లేట్లు, ఆర్డర్ ట్రాకింగ్, డెలివరీ చిరునామా, బల్క్ డిస్కౌంట్లు లేదా పెళ్లి కాంబోల గురించి మీరు ఏమైనా అడగవచ్చు. మీకు ఎలా సహాయపడగలను?"
        else:
            reply = "Namaste! 🙏 I am your Sri Lakshmi Ganapathi Smart Assistant. I can help you track your orders, recommend plate quantities for events & weddings, check delivery areas in Eluru, or connect you with Owner Anand Majji. How can I help you today?"
        quick_replies = ["Track my order", "Plates for 500 guests", "Hot curry & sambar proof?", "Delivery areas in Eluru", "Talk to Owner"]

    return jsonify({
        "success": True,
        "reply": reply,
        "quick_replies": quick_replies,
        "order_data": order_data
    })

# ----------------- STATIC & SPA ROUTES -----------------

@app.route("/manifest.json")
def serve_manifest():
    return send_from_directory(STATIC_DIR, "manifest.json", mimetype="application/manifest+json")

@app.route("/sw.js")
def serve_sw():
    return send_from_directory(STATIC_DIR, "sw.js", mimetype="application/javascript")

@app.after_request
def add_cache_headers(response):
    if request.path.endswith('.html') or request.path.endswith('.js') or request.path == '/' or request.path.endswith('.css'):
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    if path != "" and os.path.exists(os.path.join(STATIC_DIR, path)):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)

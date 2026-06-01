"""Backend tests for PequeWorld tienda infantil API."""
import uuid
import pytest
import requests


# ============ HEALTH ============
class TestHealth:
    def test_root(self, api_url):
        r = requests.get(f"{api_url}/")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "online"
        assert "PequeWorld" in data["message"]


# ============ AUTH ============
class TestAuth:
    def test_login_admin_success(self, api_url):
        r = requests.post(
            f"{api_url}/auth/login",
            json={"email": "admin@tienda.com", "password": "admin123"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data and isinstance(data["access_token"], str)
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "admin@tienda.com"
        assert data["user"]["role"] == "admin"
        assert "hashed_password" not in data["user"]

    def test_login_invalid(self, api_url):
        r = requests.post(
            f"{api_url}/auth/login",
            json={"email": "admin@tienda.com", "password": "wrong"},
        )
        assert r.status_code == 401

    def test_register_new_user(self, api_url):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "email": f"TEST_register_{unique}@example.com",
            "password": "Password123!",
            "full_name": "TEST Register",
            "phone": "3001234567",
            "address": "Calle 1",
        }
        r = requests.post(f"{api_url}/auth/register", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["user"]["email"] == payload["email"]
        assert data["user"]["role"] == "customer"
        assert "access_token" in data

    def test_register_duplicate_email(self, api_url):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "email": f"TEST_dup_{unique}@example.com",
            "password": "Password123!",
            "full_name": "Dup",
        }
        r1 = requests.post(f"{api_url}/auth/register", json=payload)
        assert r1.status_code == 201
        r2 = requests.post(f"{api_url}/auth/register", json=payload)
        assert r2.status_code == 400

    def test_get_me_with_token(self, api_url, admin_headers):
        r = requests.get(f"{api_url}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == "admin@tienda.com"
        assert data["role"] == "admin"

    def test_get_me_no_token(self, api_url):
        r = requests.get(f"{api_url}/auth/me")
        assert r.status_code in (401, 403)

    def test_get_me_invalid_token(self, api_url):
        r = requests.get(
            f"{api_url}/auth/me",
            headers={"Authorization": "Bearer invalidtoken"},
        )
        assert r.status_code == 401


# ============ CATEGORIES ============
class TestCategories:
    def test_list_categories_public(self, api_url):
        r = requests.get(f"{api_url}/categories")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        slugs = {c["slug"] for c in data}
        # Seed should contain at least one of these
        assert slugs & {"juguetes", "ropa", "libros", "juegos-de-mesa", "arte-manualidades"}

    def test_create_category_admin(self, api_url, admin_headers):
        unique = uuid.uuid4().hex[:6]
        payload = {
            "name": f"TEST Cat {unique}",
            "slug": f"test-cat-{unique}",
            "description": "Test category",
            "image_base64": "",
        }
        r = requests.post(f"{api_url}/categories", json=payload, headers=admin_headers)
        assert r.status_code == 201, r.text
        cat = r.json()
        assert cat["slug"] == payload["slug"]
        assert "id" in cat
        # Verify it appears in list
        r2 = requests.get(f"{api_url}/categories")
        slugs = {c["slug"] for c in r2.json()}
        assert payload["slug"] in slugs
        # Cleanup
        requests.delete(f"{api_url}/categories/{cat['id']}", headers=admin_headers)

    def test_create_category_unauthorized(self, api_url, customer_headers):
        unique = uuid.uuid4().hex[:6]
        payload = {"name": "x", "slug": f"x-{unique}"}
        r = requests.post(f"{api_url}/categories", json=payload, headers=customer_headers)
        assert r.status_code == 403

    def test_create_category_no_auth(self, api_url):
        unique = uuid.uuid4().hex[:6]
        r = requests.post(f"{api_url}/categories", json={"name": "x", "slug": f"x-{unique}"})
        assert r.status_code in (401, 403)


# ============ PRODUCTS ============
class TestProducts:
    def test_list_products_public(self, api_url):
        r = requests.get(f"{api_url}/products")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Check structure
        p = data[0]
        for key in ("id", "name", "slug", "price", "stock"):
            assert key in p

    def test_filter_products_by_category(self, api_url):
        r = requests.get(f"{api_url}/products", params={"category": "juguetes"})
        assert r.status_code == 200
        data = r.json()
        # All should be category juguetes if any exist
        if data:
            for p in data:
                if p.get("category"):
                    assert p["category"]["slug"] == "juguetes"

    def test_filter_products_featured(self, api_url):
        r = requests.get(f"{api_url}/products", params={"featured": "true"})
        assert r.status_code == 200
        data = r.json()
        for p in data:
            assert p["featured"] is True

    def test_search_products(self, api_url):
        r = requests.get(f"{api_url}/products", params={"search": "bloques"})
        assert r.status_code == 200

    def test_get_product_detail(self, api_url):
        r = requests.get(f"{api_url}/products")
        assert r.status_code == 200
        products = r.json()
        if not products:
            pytest.skip("No products to test detail")
        pid = products[0]["id"]
        r2 = requests.get(f"{api_url}/products/{pid}")
        assert r2.status_code == 200
        assert r2.json()["id"] == pid

    def test_get_product_not_found(self, api_url):
        r = requests.get(f"{api_url}/products/nonexistent-id-xyz")
        assert r.status_code == 404

    def test_product_crud_admin(self, api_url, admin_headers):
        unique = uuid.uuid4().hex[:6]
        # CREATE
        payload = {
            "name": f"TEST Product {unique}",
            "slug": f"test-product-{unique}",
            "description": "Test description",
            "price": 12345,
            "stock": 10,
            "image_base64": "",
            "featured": False,
        }
        r = requests.post(f"{api_url}/products", json=payload, headers=admin_headers)
        assert r.status_code == 201, r.text
        prod = r.json()
        pid = prod["id"]
        assert prod["name"] == payload["name"]
        assert prod["price"] == 12345
        assert prod["stock"] == 10

        # GET verify persistence
        r2 = requests.get(f"{api_url}/products/{pid}")
        assert r2.status_code == 200
        assert r2.json()["name"] == payload["name"]

        # UPDATE
        r3 = requests.put(
            f"{api_url}/products/{pid}",
            json={"price": 99999, "stock": 5},
            headers=admin_headers,
        )
        assert r3.status_code == 200
        assert r3.json()["price"] == 99999
        assert r3.json()["stock"] == 5

        # Verify persisted
        r4 = requests.get(f"{api_url}/products/{pid}")
        assert r4.json()["price"] == 99999

        # DELETE
        r5 = requests.delete(f"{api_url}/products/{pid}", headers=admin_headers)
        assert r5.status_code == 204

        # Verify removed
        r6 = requests.get(f"{api_url}/products/{pid}")
        assert r6.status_code == 404

    def test_product_create_customer_forbidden(self, api_url, customer_headers):
        payload = {
            "name": "x",
            "slug": f"x-{uuid.uuid4().hex[:6]}",
            "price": 100,
            "stock": 1,
        }
        r = requests.post(f"{api_url}/products", json=payload, headers=customer_headers)
        assert r.status_code == 403


# ============ CART ============
class TestCart:
    @pytest.fixture
    def product_id(self, api_url):
        r = requests.get(f"{api_url}/products")
        products = r.json()
        if not products:
            pytest.skip("No products available")
        # Pick one with stock
        for p in products:
            if p["stock"] > 0:
                return p["id"]
        pytest.skip("No products with stock")

    def test_cart_requires_auth(self, api_url):
        r = requests.get(f"{api_url}/cart")
        assert r.status_code in (401, 403)

    def test_add_get_update_delete_cart(self, api_url, customer_headers, product_id):
        # Clear cart first
        requests.delete(f"{api_url}/cart", headers=customer_headers)

        # ADD
        r = requests.post(
            f"{api_url}/cart",
            json={"product_id": product_id, "quantity": 2},
            headers=customer_headers,
        )
        assert r.status_code == 201, r.text
        item = r.json()
        item_id = item["id"]
        assert item["quantity"] == 2
        assert item["product_id"] == product_id

        # GET
        r2 = requests.get(f"{api_url}/cart", headers=customer_headers)
        assert r2.status_code == 200
        cart = r2.json()
        assert len(cart) >= 1
        found = [c for c in cart if c["id"] == item_id]
        assert found
        assert found[0]["product"] is not None

        # Adding same product should increment
        r3 = requests.post(
            f"{api_url}/cart",
            json={"product_id": product_id, "quantity": 1},
            headers=customer_headers,
        )
        assert r3.status_code == 201
        assert r3.json()["quantity"] == 3

        # UPDATE - quantity passed as query
        r4 = requests.put(
            f"{api_url}/cart/{item_id}?quantity=5",
            headers=customer_headers,
        )
        assert r4.status_code == 200, r4.text
        assert r4.json()["quantity"] == 5

        # DELETE
        r5 = requests.delete(f"{api_url}/cart/{item_id}", headers=customer_headers)
        assert r5.status_code == 204

        # Verify gone
        r6 = requests.get(f"{api_url}/cart", headers=customer_headers)
        assert all(c["id"] != item_id for c in r6.json())

    def test_add_nonexistent_product(self, api_url, customer_headers):
        r = requests.post(
            f"{api_url}/cart",
            json={"product_id": "nonexistent-xyz", "quantity": 1},
            headers=customer_headers,
        )
        assert r.status_code == 404

    def test_update_cart_invalid_quantity(self, api_url, customer_headers, product_id):
        requests.delete(f"{api_url}/cart", headers=customer_headers)
        r = requests.post(
            f"{api_url}/cart",
            json={"product_id": product_id, "quantity": 1},
            headers=customer_headers,
        )
        assert r.status_code == 201
        item_id = r.json()["id"]
        r2 = requests.put(
            f"{api_url}/cart/{item_id}?quantity=0",
            headers=customer_headers,
        )
        assert r2.status_code == 400
        # Cleanup
        requests.delete(f"{api_url}/cart/{item_id}", headers=customer_headers)


# ============ ORDERS ============
class TestOrders:
    @pytest.fixture
    def product_with_stock(self, api_url):
        r = requests.get(f"{api_url}/products")
        for p in r.json():
            if p["stock"] >= 1:
                return p
        pytest.skip("No product with stock")

    def test_create_order_empty_cart(self, api_url, customer_headers):
        # Clear cart
        requests.delete(f"{api_url}/cart", headers=customer_headers)
        payload = {
            "shipping_address": {
                "name": "Test", "phone": "3001112222",
                "street": "Calle 1", "city": "Bogota",
                "state": "Cundinamarca", "zip_code": "111111",
            },
            "payment_info": {"method": "mercadopago"},
        }
        r = requests.post(f"{api_url}/orders", json=payload, headers=customer_headers)
        assert r.status_code == 400

    def test_full_order_flow(self, api_url, customer_headers, product_with_stock):
        product = product_with_stock
        initial_stock = product["stock"]
        # Clear and add to cart
        requests.delete(f"{api_url}/cart", headers=customer_headers)
        r = requests.post(
            f"{api_url}/cart",
            json={"product_id": product["id"], "quantity": 1},
            headers=customer_headers,
        )
        assert r.status_code == 201

        # Create order
        payload = {
            "shipping_address": {
                "name": "TEST Cust", "phone": "3001112222",
                "street": "Calle Test 123", "city": "Bogota",
                "state": "Cundinamarca", "zip_code": "111111",
            },
            "payment_info": {"method": "nequi"},
        }
        r2 = requests.post(f"{api_url}/orders", json=payload, headers=customer_headers)
        assert r2.status_code == 201, r2.text
        order = r2.json()
        order_id = order["id"]
        assert order["total"] == product["price"]
        assert order["status"] == "pending"
        assert order["payment_info"]["method"] == "nequi"

        # GET orders for user
        r3 = requests.get(f"{api_url}/orders", headers=customer_headers)
        assert r3.status_code == 200
        assert any(o["id"] == order_id for o in r3.json())

        # GET specific order with items
        r4 = requests.get(f"{api_url}/orders/{order_id}", headers=customer_headers)
        assert r4.status_code == 200
        detail = r4.json()
        assert len(detail["items"]) >= 1
        assert detail["items"][0]["product_id"] == product["id"]

        # Verify stock decremented
        r5 = requests.get(f"{api_url}/products/{product['id']}")
        assert r5.json()["stock"] == initial_stock - 1

        # Verify cart cleared
        r6 = requests.get(f"{api_url}/cart", headers=customer_headers)
        assert r6.json() == []

        return order_id

    def test_list_orders_admin_sees_all(self, api_url, admin_headers):
        r = requests.get(f"{api_url}/orders", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_update_order_status_admin(self, api_url, admin_headers, customer_headers, product_with_stock):
        # Create an order first
        requests.delete(f"{api_url}/cart", headers=customer_headers)
        r = requests.post(
            f"{api_url}/cart",
            json={"product_id": product_with_stock["id"], "quantity": 1},
            headers=customer_headers,
        )
        assert r.status_code == 201
        payload = {
            "shipping_address": {
                "name": "T", "phone": "3", "street": "s",
                "city": "c", "state": "st", "zip_code": "1",
            },
            "payment_info": {"method": "transferencia"},
        }
        r2 = requests.post(f"{api_url}/orders", json=payload, headers=customer_headers)
        assert r2.status_code == 201
        order_id = r2.json()["id"]

        # Update status as admin
        r3 = requests.put(
            f"{api_url}/orders/{order_id}/status?status=processing",
            headers=admin_headers,
        )
        assert r3.status_code == 200

        # Verify persisted
        r4 = requests.get(f"{api_url}/orders/{order_id}", headers=admin_headers)
        assert r4.json()["status"] == "processing"

        # Invalid status
        r5 = requests.put(
            f"{api_url}/orders/{order_id}/status?status=bogus",
            headers=admin_headers,
        )
        assert r5.status_code == 400

    def test_update_order_status_customer_forbidden(self, api_url, customer_headers):
        r = requests.put(
            f"{api_url}/orders/fake-id/status?status=processing",
            headers=customer_headers,
        )
        assert r.status_code == 403

    def test_customer_cannot_see_other_orders(self, api_url, customer_headers):
        # Try to fetch a random nonexistent order
        r = requests.get(f"{api_url}/orders/nonexistent-xyz", headers=customer_headers)
        assert r.status_code == 404


# ============ ADMIN: USERS & STATS ============
class TestAdminEndpoints:
    def test_list_users_admin(self, api_url, admin_headers):
        r = requests.get(f"{api_url}/users", headers=admin_headers)
        assert r.status_code == 200
        users = r.json()
        assert isinstance(users, list)
        assert any(u["email"] == "admin@tienda.com" for u in users)
        # No hashed_password leak
        for u in users:
            assert "hashed_password" not in u

    def test_list_users_customer_forbidden(self, api_url, customer_headers):
        r = requests.get(f"{api_url}/users", headers=customer_headers)
        assert r.status_code == 403

    def test_update_user_role(self, api_url, admin_headers):
        # Create a fresh user to promote
        unique = uuid.uuid4().hex[:8]
        reg = requests.post(
            f"{api_url}/auth/register",
            json={
                "email": f"TEST_role_{unique}@example.com",
                "password": "Password123!",
                "full_name": "Role Test",
            },
        )
        assert reg.status_code == 201
        user_id = reg.json()["user"]["id"]

        # Promote to admin
        r = requests.put(
            f"{api_url}/users/{user_id}/role?role=admin",
            headers=admin_headers,
        )
        assert r.status_code == 200

        # Verify
        r2 = requests.get(f"{api_url}/users", headers=admin_headers)
        target = [u for u in r2.json() if u["id"] == user_id]
        assert target and target[0]["role"] == "admin"

        # Invalid role
        r3 = requests.put(
            f"{api_url}/users/{user_id}/role?role=superuser",
            headers=admin_headers,
        )
        assert r3.status_code == 400

    def test_admin_stats(self, api_url, admin_headers):
        r = requests.get(f"{api_url}/admin/stats", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        for key in ("total_products", "total_orders", "total_users", "total_revenue", "recent_orders"):
            assert key in data
        assert isinstance(data["total_products"], int)
        assert data["total_users"] >= 1

    def test_admin_stats_customer_forbidden(self, api_url, customer_headers):
        r = requests.get(f"{api_url}/admin/stats", headers=customer_headers)
        assert r.status_code == 403

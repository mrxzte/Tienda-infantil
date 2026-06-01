"""
Módulo de integración con Mercado Pago - Checkout Pro
Soporta: Tarjetas, PSE, Nequi, Bancolombia, Efecty, Baloto
"""
import os
import mercadopago
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Inicializar SDK de Mercado Pago
MP_ACCESS_TOKEN = os.environ.get('MP_ACCESS_TOKEN', '')
MP_PUBLIC_KEY = os.environ.get('MP_PUBLIC_KEY', '')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:8001')

sdk = mercadopago.SDK(MP_ACCESS_TOKEN) if MP_ACCESS_TOKEN else None


def is_configured() -> bool:
    """Verifica si Mercado Pago está configurado correctamente"""
    return bool(MP_ACCESS_TOKEN and sdk)


def create_preference(order_id: str, items: list, payer_email: str, payer_name: str = "") -> dict:
    """
    Crea una preferencia de pago en Mercado Pago.
    
    Args:
        order_id: ID del pedido en nuestra base de datos
        items: Lista de productos [{name, quantity, price, image_base64}]
        payer_email: Email del comprador
        payer_name: Nombre del comprador
    
    Returns:
        dict con init_point (URL de pago), preference_id, sandbox_init_point
    """
    if not sdk:
        raise Exception("Mercado Pago no está configurado")
    
    # Construir items para Mercado Pago
    mp_items = []
    for item in items:
        mp_items.append({
            "id": str(item.get("product_id", "")),
            "title": item["name"][:60],  # MP limita a 256 chars
            "description": item.get("description", "")[:255] or item["name"][:255],
            "quantity": int(item["quantity"]),
            "unit_price": float(item["price"]),
            "currency_id": "COP",
        })
    
    preference_data = {
        "items": mp_items,
        "payer": {
            "email": payer_email,
            "name": payer_name,
        },
        "external_reference": order_id,
        "back_urls": {
            "success": f"{FRONTEND_URL}/checkout/result",
            "failure": f"{FRONTEND_URL}/checkout/result",
            "pending": f"{FRONTEND_URL}/checkout/result",
        },
        "auto_return": "approved",
        "notification_url": f"{BACKEND_URL}/api/payments/webhook",
        "statement_descriptor": "PEQUEWORLD",
        "binary_mode": False,  # Permite estados pending
    }
    
    logger.info(f"Creando preferencia MP para orden {order_id}")
    response = sdk.preference().create(preference_data)
    
    if response.get("status") not in (200, 201):
        logger.error(f"Error creando preferencia MP: {response}")
        raise Exception(f"Error creando preferencia: {response.get('response', {}).get('message', 'Unknown error')}")
    
    pref = response["response"]
    return {
        "init_point": pref.get("init_point"),
        "sandbox_init_point": pref.get("sandbox_init_point"),
        "preference_id": pref.get("id"),
    }


def get_payment(payment_id: str) -> Optional[dict]:
    """
    Obtiene los detalles de un pago desde Mercado Pago.
    
    Args:
        payment_id: ID del pago en Mercado Pago
    
    Returns:
        dict con detalles del pago o None si hay error
    """
    if not sdk:
        return None
    
    try:
        response = sdk.payment().get(payment_id)
        if response.get("status") in (200, 201):
            return response["response"]
    except Exception as e:
        logger.error(f"Error obteniendo pago {payment_id}: {e}")
    
    return None


def map_mp_status_to_order_status(mp_status: str) -> str:
    """
    Mapea el estado de Mercado Pago a nuestro estado de pedido.
    
    MP statuses: approved, pending, in_process, rejected, cancelled, refunded, charged_back
    Order statuses: pending, processing, shipped, delivered, cancelled
    """
    mapping = {
        "approved": "processing",  # Pago aprobado → procesar pedido
        "pending": "pending",
        "in_process": "pending",
        "rejected": "cancelled",
        "cancelled": "cancelled",
        "refunded": "cancelled",
        "charged_back": "cancelled",
    }
    return mapping.get(mp_status, "pending")


def map_mp_status_to_payment_status(mp_status: str) -> str:
    """Mapea estado de MP a nuestro estado de pago"""
    mapping = {
        "approved": "approved",
        "pending": "pending",
        "in_process": "pending",
        "rejected": "rejected",
        "cancelled": "cancelled",
        "refunded": "cancelled",
        "charged_back": "cancelled",
    }
    return mapping.get(mp_status, "pending")

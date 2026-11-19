from models import Cart, CartItem


def find_cart(token):
    return Cart.query.filter_by(token=token).first()


def find_item(cart, product_id):
    return CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()

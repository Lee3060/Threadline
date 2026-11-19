from core.validation import Field

from features.cart.service import MAX_QTY_PER_ITEM

AddItemRequest = {
    "product_id": Field(int, required=True, min=1),
    "quantity": Field(int, default=1, min=1, max=MAX_QTY_PER_ITEM),
}

UpdateItemRequest = {
    "quantity": Field(int, required=True, min=1, max=MAX_QTY_PER_ITEM),
}

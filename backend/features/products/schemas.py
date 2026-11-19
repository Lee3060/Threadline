from core.validation import Field

SORT_OPTIONS = ("featured", "price_asc", "price_desc", "newest", "rating")

ListProductsQuery = {
    "category": Field(str, max_length=80),
    "search": Field(str, max_length=100),
    "sort": Field(str, default="featured", choices=SORT_OPTIONS),
    "min_price": Field(float, min=0),
    "max_price": Field(float, min=0),
}

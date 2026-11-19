from features.categories import repository as repo


def list_categories():
    return [category.to_dict(product_count=count) for category, count in repo.categories_with_counts()]

"""Tiny request validation: describe the fields once in schemas.py, call load()."""
from core.errors import ApiError

_MISSING = object()


class Field:
    def __init__(self, type_, required=False, default=None, min=None, max=None,
                 choices=None, max_length=None):
        self.type = type_
        self.required = required
        self.default = default
        self.min = min
        self.max = max
        self.choices = choices
        self.max_length = max_length

    def clean(self, name, raw):
        value = raw
        if self.type is str:
            value = str(raw).strip()
            if self.max_length and len(value) > self.max_length:
                raise ValueError(f"must be at most {self.max_length} characters")
        elif self.type in (int, float):
            if isinstance(raw, bool):
                raise ValueError("must be a number")
            try:
                value = self.type(raw)
            except (TypeError, ValueError):
                raise ValueError("must be a number")
            if self.type is int and isinstance(raw, float) and not raw.is_integer():
                raise ValueError("must be a whole number")
            if self.min is not None and value < self.min:
                raise ValueError(f"must be at least {self.min}")
            if self.max is not None and value > self.max:
                raise ValueError(f"must be at most {self.max}")
        if self.choices is not None and value not in self.choices:
            raise ValueError(f"must be one of: {', '.join(map(str, self.choices))}")
        return value


def load(schema, data):
    """Return clean values for every field in schema, or raise one ApiError listing all problems."""
    data = data or {}
    result, errors = {}, {}
    for name, field in schema.items():
        raw = data.get(name, _MISSING)
        if raw is _MISSING or raw is None or raw == "":
            if field.required:
                errors[name] = "is required"
            else:
                result[name] = field.default
            continue
        try:
            result[name] = field.clean(name, raw)
        except ValueError as exc:
            errors[name] = str(exc)
    if errors:
        first = next(iter(errors.items()))
        raise ApiError(f"{first[0]} {first[1]}", status=422, code="VALIDATION_ERROR", details=errors)
    return result

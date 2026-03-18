def encode_key(key: str) -> str:
    """
    Encode each character by shifting its ASCII code by +5.
    Non-ASCII safe by using Python int/chr behavior.
    """
    return "".join(chr(ord(c) + 5) for c in key)

# Example:
plain = ""
encoded = encode_key(plain)
print(encoded)  # mnqqt678  (h->m, e->j, l->q, l->q, o->t, 1->6, 2->7, 3->8)
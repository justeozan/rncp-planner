#!/usr/bin/env python3
"""Rafraichit les dumps de l'API 42 dans data/.

    python3 fetch.py

Ne touche pas a data/rules.json, qui est ecrit a la main.
Source : https://github.com/lucas-ht/42calculator (dumps du cursus 21).
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
BASE = "https://raw.githubusercontent.com/lucas-ht/42calculator/main/data/"
FILES = ("projects_21.json", "rncp_21.json", "experience_21.json")


def main():
    os.makedirs(DATA, exist_ok=True)
    for name in FILES:
        url = BASE + name
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                body = r.read()
            payload = json.loads(body)  # refuse d'ecrire du JSON casse
        except Exception as exc:
            print(f"!! {name}: {exc}", file=sys.stderr)
            return 1
        dest = os.path.join(DATA, name)
        old = os.path.getsize(dest) if os.path.exists(dest) else 0
        with open(dest, "wb") as fh:
            fh.write(body)
        n = len(payload.get("projects", payload.get("rncp", payload.get("levels", []))))
        print(f"   {name:<22} {len(body) // 1024:>4} Ko  {n:>4} entrees"
              f"{'' if old == len(body) else '  (modifie)'}")
    print("\nles conditions RNCP peuvent avoir change -> relance build.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())

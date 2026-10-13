#!/usr/bin/env python3
"""
Serveur de développement local.

Ajoute l'en-tête Content-Security-Policy-Report-Only (identique à la meta CSP
du site) pour voir dans la console du navigateur ce qu'une CSP stricte
bloquerait, et désactive le cache pour voir chaque modification.

  python scripts/serve.py [port]   -> http://localhost:8080
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

CSP = ("default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
       "font-src 'self'; media-src 'self'; connect-src 'self'; object-src 'none'; "
       "base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'; require-trusted-types-for 'script'")


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".mjs": "text/javascript",
                      ".json": "application/json", ".webp": "image/webp",
                      ".woff2": "font/woff2", ".svg": "image/svg+xml"}

    def end_headers(self):
        self.send_header("Content-Security-Policy-Report-Only", CSP)
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    root = Path(__file__).resolve().parent.parent
    with ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(root))) as httpd:
        print(f"-> http://localhost:{port}  (racine : {root})")
        httpd.serve_forever()

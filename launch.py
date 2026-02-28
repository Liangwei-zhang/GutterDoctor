#!/usr/bin/env python3
"""Launch GutterDoctor static site locally.

- Serves the current directory on http://localhost:8000 using the built‑in
  http.server module.
- Opens the default web browser to that URL.
- Keeps the server running until the script is interrupted (Ctrl+C).
"""
import http.server
import socketserver
import threading
import webbrowser
import os
import signal
import sys

PORT = 8000

def start_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving GutterDoctor at http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    # Run the HTTP server in a separate daemon thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Give the server a moment to start
    import time
    time.sleep(1)

    # Open the default web browser
    webbrowser.open(f"http://localhost:{PORT}")

    try:
        # Keep the main thread alive while the server runs
        while server_thread.is_alive():
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nShutting down server…")
        sys.exit(0)

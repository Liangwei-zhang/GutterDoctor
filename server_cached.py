#!/usr/bin/env python3
"""
Simple HTTP server with caching headers for static files
"""
import http.server
import socketserver
import os
from datetime import datetime, timedelta

PORT = 5000

class CacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Cache images for 1 year (31536000 seconds)
        if self.path.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico')):
            self.send_header('Cache-Control', 'public, max-age=31536000')
            self.send_header('Expires', (datetime.now() + timedelta(days=365)).strftime('%a, %d %b %Y %H:%M:%S GMT'))
        # Cache CSS/JS for 1 week
        elif self.path.lower().endswith(('.css', '.js', '.woff', '.woff2', '.ttf', '.eot')):
            self.send_header('Cache-Control', 'public, max-age=604800')
        # Cache HTML minimally
        elif self.path.lower().endswith(('.html', '.htm')):
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        
        # Enable gzip-like compression hint
        self.send_header('Vary', 'Accept-Encoding')
        
        super().end_headers()
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), CacheHTTPRequestHandler) as httpd:
    print(f"🚀 Server with caching enabled at http://localhost:{PORT}")
    httpd.serve_forever()

#!/usr/bin/env python3
"""
GutterDoctor Server with form submission and admin panel
"""
import http.server
import socketserver
import os
import json
import uuid
from datetime import datetime
from urllib.parse import parse_qs, urlparse

PORT = 7070
DATA_FILE = 'data/orders.json'

class GutterDoctorHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Cache settings
        if self.path.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico')):
            self.send_header('Cache-Control', 'public, max-age=604800')
        elif self.path.lower().endswith(('.css', '.js', '.woff', '.woff2', '.ttf', '.eot')):
            self.send_header('Cache-Control', 'public, max-age=604800')
        elif self.path.lower().endswith(('.html', '.htm')):
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    
    def do_POST(self):
        if self.path == '/api/submit':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = parse_qs(post_data.decode('utf-8'))
            
            # Convert to regular dict with limits
            def safe_value(v, max_len=1000):
                if not v:
                    return ''
                s = v[0].strip()[:max_len]
                # Basic XSS prevention
                s = s.replace('<', '&lt;').replace('>', '&gt;')
                return s
            
            order = {
                'name': safe_value(data.get('name'), 100),
                'phone': safe_value(data.get('phone'), 20),
                'email': safe_value(data.get('email'), 100),
                'service': safe_value(data.get('service'), 50),
                'message': safe_value(data.get('message'), 1000)
            }
            order['id'] = str(uuid.uuid4())[:8]
            order['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Load existing orders
            os.makedirs('data', exist_ok=True)
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r') as f:
                    orders = json.load(f)
            else:
                orders = []
            
            orders.append(order)
            
            with open(DATA_FILE, 'w') as f:
                json.dump(orders, f, indent=2, ensure_ascii=False)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'id': order['id']}).encode())
        else:
            self.send_error(404)
    
    def do_GET(self):
        parsed = urlparse(self.path)
        
        if parsed.path == '/api/orders':
            # Check password
            query = parse_qs(parsed.query)
            password = query.get('password', [''])[0]
            
            if password != '1q2w3e4r':
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Unauthorized'}).encode())
                return
            
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r') as f:
                    orders = json.load(f)
            else:
                orders = []
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(orders).encode())
            return
        
        # Serve static files
        super().do_GET()
    
    def log_message(self, format, *args):
        print(f'[{self.log_date_time_string()}] {args[0]}')

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(('', PORT), GutterDoctorHandler) as httpd:
    print(f'🚀 GutterDoctor Server at http://localhost:{PORT}')
    print(f'📝 Orders saved to: {DATA_FILE}')
    httpd.serve_forever()

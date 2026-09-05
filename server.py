import json
import os
import cgi
import uuid
from urllib.parse import parse_qs, urlparse
import psycopg
from psycopg.rows import dict_row
from qcloud_cos import CosConfig, CosS3Client
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
schema_ready = False

def db():
    global schema_ready
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg.connect(database_url, row_factory=dict_row) if database_url else psycopg.connect(host=os.environ.get('DB_HOST', 'postgres'), port=os.environ.get('DB_PORT', 5432), user=os.environ.get('DB_USER', 'myfood'), password=os.environ.get('DB_PASSWORD', 'myfood'), dbname=os.environ.get('DB_NAME', 'myfood'), row_factory=dict_row)
    conn.autocommit = True
    if not schema_ready:
        with conn.cursor() as cursor:
            cursor.execute("CREATE TABLE IF NOT EXISTS foods (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, ingredients TEXT NOT NULL, flavors TEXT NOT NULL, preference VARCHAR(32) NOT NULL, image_path VARCHAR(500) NOT NULL DEFAULT '')")
            cursor.execute("ALTER TABLE foods ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255) NOT NULL DEFAULT ''")
            cursor.execute("ALTER TABLE foods ADD COLUMN IF NOT EXISTS dislike_reason VARCHAR(500) NOT NULL DEFAULT ''")
            cursor.execute("ALTER TABLE foods ADD COLUMN IF NOT EXISTS repurchase_count INTEGER NOT NULL DEFAULT 0")
            cursor.execute("ALTER TABLE foods ADD COLUMN IF NOT EXISTS tags TEXT NOT NULL DEFAULT '[]'")
            cursor.execute("ALTER TABLE foods DROP COLUMN IF EXISTS category")
            cursor.execute("CREATE TABLE IF NOT EXISTS tags (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL, category VARCHAR(255) NOT NULL DEFAULT '')")
            cursor.execute("CREATE TABLE IF NOT EXISTS ingredients (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)")
            initial_tags = ['麻麻', '我要', '排练', '米米', '壹壹', '富贵', '紙', '鑫茶', '南瓜饼', '板栗饼', '榴莲饼', '薏米糕', '老婆饼', '芋泥饼', '芡实糕', '桂花糕', '凤梨酥', '绿豆饼', '芝麻饼', '绿豆糕', '肉松饼', '鲜花饼', '雪花酥', '沙琪玛', '蛋黄酥']
            cursor.executemany("INSERT INTO tags (name, category) VALUES (%s, '中式糕点') ON CONFLICT (name) DO NOTHING", [(tag,) for tag in initial_tags])
            cursor.execute("SELECT ingredients FROM foods")
            for row in cursor.fetchall():
                for ingredient in json.loads(row['ingredients'] or '[]'):
                    ingredient = ingredient.strip()
                    if ingredient:
                        cursor.execute("INSERT INTO ingredients (name) VALUES (%s) ON CONFLICT (name) DO NOTHING", (ingredient,))
        schema_ready = True
    return conn

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_json(self, value, status=200):
        body = json.dumps(value, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def cos_client(self):
        return CosS3Client(CosConfig(Region=os.environ['COS_REGION'], SecretId=os.environ['COS_SECRET_ID'], SecretKey=os.environ['COS_SECRET_KEY']))

    def signed_url(self, key):
        if not key:
            return ''
        key = key.split('.com/', 1)[-1]
        return self.cos_client().get_presigned_download_url(Bucket=os.environ['COS_BUCKET'], Key=key, Expired=900)

    def do_GET(self):
        if self.path.startswith('/api/foods'):
            query = parse_qs(urlparse(self.path).query)
            page = max(int(query.get('page', ['1'])[0]), 1)
            search = query.get('search', [''])[0].strip()
            limit = min(max(int(query.get('limit', ['5'])[0]), 1), 50)
            offset = (page - 1) * limit
            conn = db()
            with conn.cursor() as cursor:
                cursor.execute('SELECT COUNT(*) AS total FROM foods WHERE name ILIKE %s OR brand_name ILIKE %s', (f'%{search}%', f'%{search}%'))
                total = cursor.fetchone()['total']
                cursor.execute('SELECT id, name, brand_name, tags, ingredients, flavors, preference, dislike_reason, repurchase_count, image_path FROM foods WHERE name ILIKE %s OR brand_name ILIKE %s ORDER BY id DESC LIMIT %s OFFSET %s', (f'%{search}%', f'%{search}%', limit, offset))
                rows = cursor.fetchall()
            conn.close()
            self.send_json({'items': [{**row, 'ingredients': json.loads(row['ingredients']), 'flavors': json.loads(row['flavors']), 'tags': json.loads(row['tags']), 'image_path': self.signed_url(row['image_path'])} for row in rows], 'total': total})
            return
        if self.path == '/api/tags':
            conn = db()
            with conn.cursor() as cursor:
                cursor.execute('SELECT id, name, category FROM tags ORDER BY id')
                rows = cursor.fetchall()
            conn.close()
            self.send_json({'items': rows})
            return
        if self.path == '/api/ingredients':
            conn = db()
            with conn.cursor() as cursor:
                cursor.execute('SELECT id, name FROM ingredients ORDER BY id')
                rows = cursor.fetchall()
            conn.close()
            self.send_json({'items': rows})
            return
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/upload':
            form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': self.headers['Content-Type'], 'CONTENT_LENGTH': self.headers['Content-Length']})
            item = form['image']
            extension = os.path.splitext(item.filename or '')[1].lower() or '.jpg'
            filename = f'{uuid.uuid4().hex}{extension}'
            secret_id = os.environ['COS_SECRET_ID']
            secret_key = os.environ['COS_SECRET_KEY']
            region = os.environ['COS_REGION']
            bucket = os.environ['COS_BUCKET']
            key = f'myfood/{uuid.uuid4().hex}{extension}'
            client = CosS3Client(CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key))
            client.put_object(Bucket=bucket, Body=item.file, Key=key, ContentType=item.type or 'image/jpeg')
            self.send_json({'path': key})
            return
        if self.path != '/api/foods':
            self.send_error(404)
            return
        length = int(self.headers.get('Content-Length', 0))
        item = json.loads(self.rfile.read(length))
        conn = db()
        with conn.cursor() as cursor:
            cursor.execute('INSERT INTO foods (name, brand_name, tags, ingredients, flavors, preference, dislike_reason, image_path) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id', (item.get('name', ''), item.get('brand_name', ''), json.dumps(item.get('tags', []), ensure_ascii=False), json.dumps(item['ingredients'], ensure_ascii=False), json.dumps(item.get('flavors', []), ensure_ascii=False), item.get('preference', ''), item.get('dislike_reason', ''), item.get('image_path', '')))
            new_id = cursor.fetchone()['id']
        conn.close()
        self.send_json({'id': new_id})

    def do_PATCH(self):
        food_id = int(self.path.rsplit('/', 1)[-1])
        length = int(self.headers.get('Content-Length', 0))
        item = json.loads(self.rfile.read(length))
        conn = db()
        with conn.cursor() as cursor:
            cursor.execute('UPDATE foods SET preference = %s, dislike_reason = %s, repurchase_count = repurchase_count + %s WHERE id = %s', (item['preference'], item.get('dislike_reason', ''), 1 if item['preference'] == '偏好吃' else 0, food_id))
        conn.close()
        self.send_json({'id': food_id})


if __name__ == '__main__':
    ThreadingHTTPServer(('0.0.0.0', 80), Handler).serve_forever()

import cgi
import json
import os
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import psycopg
from psycopg.rows import dict_row
from qcloud_cos import CosConfig, CosS3Client


ROOT = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(ROOT, 'config.json'), encoding='utf-8') as file:
    CONFIG = json.load(file)

schema_ready = False


def db():
    global schema_ready
    conn = psycopg.connect(os.environ['DATABASE_URL'], row_factory=dict_row)
    conn.autocommit = True
    if not schema_ready:
        with conn.cursor() as cursor:
            cursor.execute("CREATE TABLE IF NOT EXISTS foods (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, ingredients TEXT NOT NULL, flavors TEXT NOT NULL, preference VARCHAR(32) NOT NULL, image_path VARCHAR(500) NOT NULL DEFAULT '')")
            cursor.execute("ALTER TABLE foods ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255) NOT NULL DEFAULT ''")
            cursor.execute("ALTER TABLE foods ADD COLUMN IF NOT EXISTS dislike_reason VARCHAR(500) NOT NULL DEFAULT ''")
            cursor.execute("ALTER TABLE foods ADD COLUMN IF NOT EXISTS good_reason VARCHAR(500) NOT NULL DEFAULT ''")
            cursor.execute("ALTER TABLE foods ADD COLUMN IF NOT EXISTS repurchase_count INTEGER NOT NULL DEFAULT 0")
            cursor.execute("ALTER TABLE foods ADD COLUMN IF NOT EXISTS categories TEXT NOT NULL DEFAULT '[]'")
            cursor.execute("DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'tags') THEN UPDATE foods SET categories = tags WHERE categories = '[]' AND tags <> '[]'; ALTER TABLE foods DROP COLUMN tags; END IF; END $$")
            cursor.execute("ALTER TABLE foods DROP COLUMN IF EXISTS category")
            cursor.execute("DO $$ BEGIN IF to_regclass('public.tags') IS NOT NULL AND to_regclass('public.categories') IS NULL THEN ALTER TABLE tags RENAME TO categories; END IF; END $$")
            cursor.execute("CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)")
            cursor.execute("ALTER TABLE categories DROP COLUMN IF EXISTS category")
            cursor.execute("CREATE TABLE IF NOT EXISTS ingredients (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)")
            cursor.executemany(
                "INSERT INTO categories (name) VALUES (%s) ON CONFLICT (name) DO NOTHING",
                [(category['name'],) for category in CONFIG['initial_categories']],
            )
            cursor.execute('SELECT ingredients FROM foods')
            for row in cursor.fetchall():
                for ingredient in json.loads(row['ingredients']):
                    ingredient = ingredient.strip()
                    if ingredient:
                        cursor.execute(
                            'INSERT INTO ingredients (name) VALUES (%s) ON CONFLICT (name) DO NOTHING',
                            (ingredient,),
                        )
            cursor.execute('SELECT id, flavors FROM foods')
            for row in cursor.fetchall():
                flavors = json.loads(row['flavors'])
                if any(isinstance(flavor, str) or flavor.get('level') == 75 for flavor in flavors if isinstance(flavor, (str, dict))):
                    flavors = [
                        {'name': flavor, 'level': 60} if isinstance(flavor, str) else ({**flavor, 'level': 60} if flavor.get('level') == 75 else flavor)
                        for flavor in flavors
                    ]
                    cursor.execute(
                        'UPDATE foods SET flavors = %s WHERE id = %s',
                        (json.dumps(flavors, ensure_ascii=False), row['id']),
                    )
        schema_ready = True
    return conn


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def send_json(self, value, status=200):
        body = json.dumps(value, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def cos_client(self):
        return CosS3Client(CosConfig(
            Region=os.environ['COS_REGION'],
            SecretId=os.environ['COS_SECRET_ID'],
            SecretKey=os.environ['COS_SECRET_KEY'],
        ))

    def signed_url(self, key):
        if not key:
            return ''
        key = key.split('.com/', 1)[-1]
        return self.cos_client().get_presigned_download_url(
            Bucket=os.environ['COS_BUCKET'],
            Key=key,
            Expired=CONFIG['image']['signed_url_expiry'],
        )

    def do_GET(self):
        if self.path == '/api/config':
            self.send_json({key: CONFIG[key] for key in ('pagination', 'image', 'preferences', 'flavors')})
            return
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/foods':
            query = parse_qs(parsed_path.query)
            page = max(int(query.get('page', ['1'])[0]), 1)
            search = query.get('search', [''])[0].strip()
            limit = min(
                max(int(query.get('limit', [CONFIG['pagination']['page_size']])[0]), 1),
                CONFIG['pagination']['max_page_size'],
            )
            offset = (page - 1) * limit
            conn = db()
            with conn.cursor() as cursor:
                cursor.execute(
                    'SELECT COUNT(*) AS total FROM foods WHERE name ILIKE %s OR brand_name ILIKE %s',
                    (f'%{search}%', f'%{search}%'),
                )
                total = cursor.fetchone()['total']
                cursor.execute(
                    'SELECT id, name, brand_name, categories, ingredients, flavors, preference, dislike_reason, good_reason, repurchase_count, image_path '
                    'FROM foods WHERE name ILIKE %s OR brand_name ILIKE %s '
                    'ORDER BY id DESC LIMIT %s OFFSET %s',
                    (f'%{search}%', f'%{search}%', limit, offset),
                )
                rows = cursor.fetchall()
            conn.close()
            self.send_json({
                'items': [
                    {
                        **row,
                        'ingredients': json.loads(row['ingredients']),
                        'flavors': json.loads(row['flavors']),
                        'categories': json.loads(row['categories']),
                        'image_path': self.signed_url(row['image_path']),
                    }
                    for row in rows
                ],
                'total': total,
            })
            return
        if self.path == '/api/categories':
            conn = db()
            with conn.cursor() as cursor:
                cursor.execute('SELECT id, name FROM categories ORDER BY id')
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
        if self.path == '/api/ingredients':
            length = int(self.headers['Content-Length'])
            item = json.loads(self.rfile.read(length))
            name = item['name'].strip()
            conn = db()
            with conn.cursor() as cursor:
                cursor.execute('INSERT INTO ingredients (name) VALUES (%s) ON CONFLICT (name) DO NOTHING RETURNING id, name', (name,))
                row = cursor.fetchone()
                if row is None:
                    cursor.execute('SELECT id, name FROM ingredients WHERE name = %s', (name,))
                    row = cursor.fetchone()
            conn.close()
            self.send_json(row, 201)
            return
        if self.path == '/api/upload':
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    'REQUEST_METHOD': 'POST',
                    'CONTENT_TYPE': self.headers['Content-Type'],
                    'CONTENT_LENGTH': self.headers['Content-Length'],
                },
            )
            item = form['image']
            extension = os.path.splitext(item.filename)[1].lower()
            key = f'myfood/{uuid.uuid4().hex}{extension}'
            self.cos_client().put_object(
                Bucket=os.environ['COS_BUCKET'],
                Body=item.file,
                Key=key,
                ContentType=item.type,
            )
            self.send_json({'path': key})
            return
        if self.path != '/api/foods':
            self.send_error(404)
            return
        item = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        conn = db()
        with conn.cursor() as cursor:
            cursor.execute(
                'INSERT INTO foods (name, brand_name, categories, ingredients, flavors, preference, dislike_reason, good_reason, image_path) '
                'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id',
                (
                    item.get('name', ''),
                    item.get('brand_name', ''),
                    json.dumps(item.get('categories', []), ensure_ascii=False),
                    json.dumps(item['ingredients'], ensure_ascii=False),
                    json.dumps(item.get('flavors', []), ensure_ascii=False),
                    item.get('preference', ''),
                    item.get('dislike_reason', ''),
                    item.get('good_reason', ''),
                    item.get('image_path', ''),
                ),
            )
            new_id = cursor.fetchone()['id']
        conn.close()
        self.send_json({'id': new_id})

    def do_PATCH(self):
        food_id = int(self.path.rsplit('/', 1)[-1])
        item = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        conn = db()
        with conn.cursor() as cursor:
            cursor.execute(
                'UPDATE foods SET preference = %s, dislike_reason = %s, repurchase_count = repurchase_count + %s WHERE id = %s',
                (
                    item['preference'],
                    item.get('dislike_reason', ''),
                    1 if item['preference'] == CONFIG['preferences']['good']['value'] else 0,
                    food_id,
                ),
            )
        conn.close()
        self.send_json({'id': food_id})


if __name__ == '__main__':
    host = os.environ.get('APP_HOST', '0.0.0.0')
    port = os.environ.get('PORT', os.environ.get('APP_PORT', '80'))
    ThreadingHTTPServer(
        (host, int(port)),
        Handler,
    ).serve_forever()

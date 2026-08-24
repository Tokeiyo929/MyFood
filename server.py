import json
import os
import cgi
import uuid
import pymysql
from qcloud_cos import CosConfig, CosS3Client
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
schema_ready = False

def db():
    global schema_ready
    conn = pymysql.connect(host=os.environ.get('DB_HOST', 'mysql'), port=3306, user=os.environ.get('DB_USER', 'myfood'), password=os.environ.get('DB_PASSWORD', 'myfood'), database=os.environ.get('DB_NAME', 'myfood'), cursorclass=pymysql.cursors.DictCursor, autocommit=True)
    if not schema_ready:
        with conn.cursor() as cursor:
            cursor.execute('SHOW TABLES LIKE \'foods\'')
            if cursor.fetchone():
                cursor.execute('SHOW COLUMNS FROM foods LIKE \'aromatics\'')
                if cursor.fetchone():
                    cursor.execute('CREATE TABLE foods_new (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, ingredients TEXT NOT NULL, flavors TEXT NOT NULL, preference VARCHAR(32) NOT NULL)')
                    cursor.execute('INSERT INTO foods_new (id, name, ingredients, flavors, preference) SELECT id, name, ingredients, flavors, preference FROM foods')
                    cursor.execute('DROP TABLE foods')
                    cursor.execute('RENAME TABLE foods_new TO foods')
                cursor.execute("SHOW COLUMNS FROM foods LIKE 'image_path'")
                if not cursor.fetchone():
                    cursor.execute('ALTER TABLE foods ADD COLUMN image_path VARCHAR(500) NOT NULL DEFAULT \'\'')
            else:
                cursor.execute("CREATE TABLE foods (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, ingredients TEXT NOT NULL, flavors TEXT NOT NULL, preference VARCHAR(32) NOT NULL, image_path VARCHAR(500) NOT NULL DEFAULT '')")
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
        if self.path == '/api/foods':
            conn = db()
            with conn.cursor() as cursor:
                cursor.execute('SELECT id, name, ingredients, flavors, preference, image_path FROM foods ORDER BY id DESC')
                rows = cursor.fetchall()
            conn.close()
            self.send_json([{**row, 'ingredients': json.loads(row['ingredients']), 'flavors': json.loads(row['flavors']), 'image_path': self.signed_url(row['image_path'])} for row in rows])
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
            cursor.execute('INSERT INTO foods (name, ingredients, flavors, preference, image_path) VALUES (%s, %s, %s, %s, %s)', (item.get('name', ''), json.dumps(item['ingredients'], ensure_ascii=False), json.dumps(item.get('flavors', []), ensure_ascii=False), item.get('preference', ''), item.get('image_path', '')))
            new_id = cursor.lastrowid
        conn.close()
        self.send_json({'id': new_id})

if __name__ == '__main__':
    ThreadingHTTPServer(('0.0.0.0', 80), Handler).serve_forever()

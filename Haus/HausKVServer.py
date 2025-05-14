import json
import re
import socket
import threading

class KeyValueStore:
    def __init__(self):
        self.store = {}
        self.lock = threading.Lock()

    def get(self, key):
        return self.store.get(key)

    def put(self, key, value):
        self.store[key] = value

    def delete(self, key):
        '''
        We read this as "make sure the key is not in the store", so we don't raise an error if the key is not found.
        This is a no-op if the key is not found.
        '''
        self.store.pop(key, None)

class Transaction:
    def __init__(self):
        self.active = False
        self.changes = {}

    def begin(self):
        if self.active:
            return False  # Embedded transactions not supported
        self.active = True
        self.changes = {}
        return True

    def rollback(self):
        if self.active:
            self.active = False
            self.changes = {}
            return True
        return False

    def commit(self, store):
        if self.active:
            for k, v in self.changes.items():
                if v is None:
                    store.delete(k)
                else:
                    store.put(k, v)
            self.active = False
            self.changes = {}
            return True
        return False

    def put(self, key, value):
        if not self.active:
            return False
        self.changes[key] = value
        return True

    def delete(self, key):
        if not self.active:
            return False
        self.changes[key] = None
        return True

def handle_client(conn, addr, kv_store):
    print(f"Connection from {addr}")
    transaction = Transaction()
    with conn:
        while True:
            try:
                data = conn.recv(8196) # for modern computers we can use a large buffer
                if not data:
                    break
                command = data.decode('utf-8').strip()
                cmd, key, value = (re.split(r'\s+', command, 2) + [None, None, None])[:3] # this is a hack to make sure we have 3 variables
                if not cmd:
                    continue
                cmd = cmd.upper()
                print(f'received command: {cmd} {key} on {addr}') #logging

                if cmd == 'GET':
                    if key is None or value is not None:
                        conn.sendall(b'{"status": "Error", "mesg": "GET command should have one argument"}\n')
                        continue
                    if transaction.active and key in transaction.changes:
                        value = transaction.changes[key]
                    else:
                        value = kv_store.get(key)
                    if value is None:
                        resp = '{"status": "Error", "mesg": "Key not found!"}'
                    else:
                        resp = json.dumps( {"status": "Ok", "result": value} ) # to escape the value
                        _t = json.loads(resp)
                        print(_t)
                    conn.sendall(f"{resp}\n".encode('utf-8'))

                elif cmd == 'PUT':
                    if key is None or value is None:
                        conn.sendall(b'{"status": "Error", "mesg": "PUT command should have two argument"}\n')
                        continue
                    if transaction.active:
                        transaction.put(key, value) # newer value overrides older value, if the key exists
                    else:
                        with kv_store.lock:
                            kv_store.put(key, value)
                    conn.sendall(b'{"status": "Ok"}\n')

                elif cmd == 'DEL':
                    if key is None or value is not None:
                        conn.sendall(b'{"status": "Error", "mesg": "DEL command should have one argument"}\n')
                        continue
                    if transaction.active:
                        transaction.delete(key)
                    else:
                        with kv_store.lock:
                            kv_store.delete(key)
                    conn.sendall(b'{"status": "Ok", "message": "key is not in the kv store"}\n')

                elif cmd == 'START':
                    if key is not None or value is not None:
                        conn.sendall(b'{"status": "Error", "mesg": "START command should have no argument"}\n')
                        continue
                    if transaction.begin():
                        conn.sendall(b'{"status": "Ok"}\n')
                    else:
                        conn.sendall(b'{"status": "Error", "mesg": "TRANSACTION ALREADY ACTIVE, still use it"}\n')

                elif cmd == 'ROLLBACK':
                    if key is not None or value is not None:
                        conn.sendall(b'{"status": "Error", "mesg": "ROLLBACK command should have no argument"}\n')
                        continue
                    if transaction.rollback():
                        conn.sendall(b'{"status": "Ok"}\n')
                    else:
                        conn.sendall(b'{"status": "Error", "mesg": "NO TRANSACTION, nothing to rollback"}\n')

                elif cmd == 'COMMIT':
                    if key is not None or value is not None:
                        conn.sendall(b'{"status": "Error", "mesg": "COMMIT command should have no argument"}\n')
                        continue
                    with kv_store.lock:
                        if transaction.commit(kv_store):
                            conn.sendall(b'{"status": "Ok"}\n')
                        else:
                            conn.sendall(b'{"status": "Error", "mesg": "NO TRANSACTION, nothing to commit"}\n')

                elif cmd == 'HELP' or cmd == '?':
                    help_message = (
                        "Commands:\n"
                        "GET <key>\n"
                        "PUT <key> <value>\n"
                        "DEL <key>\n"
                        "START\n"
                        "ROLLBACK\n"
                        "COMMIT\n"
                        "HELP\n"
                    )
                    conn.sendall(f'{{"status": "Ok", "message": "{help_message}"}}\n'.encode('utf-8'))

                else:
                    conn.sendall(b'{"status": "Error", "message": "The command was not recognized."}\n')

            except Exception as e:
                print(f"Error: {e}")
                break

def start_server(host='0.0.0.0', port=9888):
    kv_store = KeyValueStore()
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((host, port))
        s.listen()
        print(f"Server listening on {host}:{port}")
        while True:
            conn, addr = s.accept()
            thread = threading.Thread(target=handle_client, args=(conn, addr, kv_store))
            thread.daemon = True
            thread.start()

if __name__ == '__main__':
    start_server()


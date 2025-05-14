from HausKVServer import *

print('Test starts...')
assert 3 == 3

print('Testing kv store which records original kv values.')
kv_store = KeyValueStore()

print('\tTesting primitive operations: put, get, del.')
resp = kv_store.get('a')
assert resp is None, f'Expected None, got {resp}'

kv_store.put('a', '1')
resp = kv_store.get('a')
assert resp == '1', f'Expected 1, got {resp}'

kv_store.put('a', '2')
resp = kv_store.get('a')
assert resp == '2', f'Expected 2, got {resp}'

kv_store.delete('a')
resp = kv_store.get('a')
assert resp is None, f'Expected None, got {resp}'

print('Testing transaction.')
transaction = Transaction()
# a transaction is inactive after creation
assert transaction.active == False, f'Expected False, got {transaction.active}'
assert transaction.changes == {}, f'Expected empty dict, got {transaction.changes}'
assert transaction.put('a', '1') == False, f'Expected False, an inactive transaction cannot save operations'
assert transaction.delete('a') == False, f'Expected False, an inactive transaction cannot save operations'
assert transaction.rollback() == False, f'Expected False, an inactive transaction cannot be rolled back'
assert transaction.commit(kv_store) == False, f'Expected False, an inactive transaction cannot be committed'

res = transaction.start()
assert res == True, f'Expected True, an inactive transaction can be started' 
assert transaction.active == True, f'Expected True, got {transaction.active}'

transaction.put('a', '1')
assert 'a' in transaction.changes, f'Expected a in changes, got {transaction.changes}'
transaction.put('a', '2')
assert transaction.changes['a'] == '2', f'Expected 2, got {transaction.changes["a"]}'

transaction.delete('a')
assert 'a' in transaction.changes, f'Expected a in changes, got {transaction.changes}'
assert transaction.changes['a'] is None, f'Expected None, got {transaction.changes["a"]}'

transaction.commit(kv_store)
resp = kv_store.get('a')
assert resp is None, f'Expected None, got {resp}'

assert transaction.active == False, f'After commit, transaction should be inactive, got {transaction.active}'

transaction.start()
transaction.put('a', '1')
assert transaction.changes['a'] == '1', f'Expected 2, got {transaction.changes["a"]}'

transaction.rollback()
assert transaction.active == False, f'After rollback, transaction should be inactive, got {transaction.active}'
assert transaction.changes == {}, f'After rollback, changes should be empty, got {transaction.changes}'
resp = kv_store.get('a')
assert resp is None, f'A rollbacked transaction will not update kv store, got {resp}'

print('Integration test. Make sure an empty server is running.')
# We may start the server for the test and then shut it down after the test. This is better because we can be sure that the server is empty.
# Or, here we assume that a server is running *empty* and we can connect to it.
import time
def client_thread(name, k, v):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect(('localhost', 9888))
        msg = f"get {k}"
        s.sendall(msg.encode())
        resp = s.recv(8192).decode()
        #print(f"[{name}] Received: {resp}"')
        assert resp == '{"status": "Error", "mesg": "Key not found!"}\n', f'Expected Key not found, got {resp}'
        time.sleep(1)
        msg = f"start"
        s.sendall(msg.encode())
        resp = s.recv(8192).decode()
        #print(f"[{name}] Received: {resp}")
        assert resp == '{"status": "Ok"}\n', f'Expected success, got {resp}'
        time.sleep(1)
        msg = f"put {k} {v}"
        s.sendall(msg.encode())
        resp = s.recv(8192).decode()
        #print(f"[{name}] Received: {resp}")
        assert resp == '{"status": "Ok"}\n', f'Expected success, got {resp}'
        time.sleep(1)
        msg = f"get {k}"
        s.sendall(msg.encode())
        resp = s.recv(8192).decode()
        #print(f"[{name}] Received: {resp}")
        assert resp == f'{{"status": "Ok", "result": "{v}"}}\n', f'Expected value, got {resp}'
        time.sleep(1)
        msg = f"commit"
        s.sendall(msg.encode())
        resp = s.recv(8192).decode()
        #print(f"[{name}] Received: {resp}")
        assert resp == '{"status": "Ok"}\n', f'Expected success, got {resp}'
        time.sleep(1)
        msg = f"del {k}"
        s.sendall(msg.encode())
        resp = s.recv(8192).decode()
        #print(f"[{name}] Received: {resp}")
        assert resp == '{"status": "Ok", "message": "key is not in the kv store"}\n', f'Expected success, got {resp}'


t1 = threading.Thread(target=client_thread, args=("Client-1", 'a', '1'))
t2 = threading.Thread(target=client_thread, args=("Client-2", 'a', '2'))
t1.start()
time.sleep(0.5)
t2.start()

# Let the server run for 10 seconds
time.sleep(10)
t1.join()
t2.join()

print('Test ends.')

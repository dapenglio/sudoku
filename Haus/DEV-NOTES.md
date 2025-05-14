

A KV store can be implemented using data structure, we may use B tree, red black tree, skip list, etc, we may even use a RDBMS underneath.
However, "high performance" implies that we should use hash table.


- I am thinking, I have two thinking modes: 1. I learn how a tool works, whether it fits our needs, how to use it efficiently and even correctly. 2. 


- to use hashtable, we better keep data usage under 70%.
- We don't persistence data to disk.  Can we tolerate data loss?  
- How large is the data and how much investiment would we put on the kv store?
- Since the content does not have Time To Live (TTL), its memory footprint won't reduce if we don't run DEL.
- It may run out of memory (OOM) and get killed by operation system, if the data size keeps growing.
- Is there a time gap in which we can restart the kv store, to clean up the memory, say, in midnight?
- in real time when I see such a request, i will have talks with all stakeholder to under and motivation and the ideal implementation
- Python is the main language of Haus. Python can easily be high throughput, but not necessarily high performance. In a real project, I won't choose Python.
- Some high performance cache are free and on the shelf, may we use them? If it is open sourced, we may even modify the source code to fit our needs.

"One potential use case for this server will be as a high performance cache." 
For example, since USA population is about 350M, a cache that can hold 1B users is big enouhg if save the information of natural humans.
For a marketing company, a cache that hold 1B user profiles is not enough since each customer has their user ids.

- For an in-memory kv datastore, still, we can partition the data, distribute kv stores on multi cpu cores for high performance, CAP, high availability, etc
-- I have started multi Redis instances on a computer that had multi cpu cores before Redis cluster appeared


- support multiple clients, this means multi threads and concurrency control;    i planed to use Python,but python has GIL and cannot support real concurrency, nodes.js can be use to easily start a web sever, however, javascript is single threaded in nature. I need time to think what language I can use
-- A online searched returned that Python dict is not thread safe. I explicitly sync operations on it.

- atomic transaction, means that we have to lock other reads and writes
-- we may fine tune the granularity of the concurrency control, say, a transaction on key `a` does not interfere with another transaction on key `b`
-- for this test, I lock the whole dict

- exception control; if one PUT fails, we should rollback all other PUTs 
-- e.g., if we buffer many PUTs in a transaction and use up the memory, some PUTs will succeed but some others will fail.
-- Don't consider this scenario, because a hash table already has too many collisions and the performance becomes terrible. This should not happen in a good production environment.
-- Even if we try, we cannot guarantee that we will be rollback a transaction, because the memory could be used up by another client at the time.

-  over a plain socket connection, so, it is the telnet protocol
- all commands and server responses will be assumed to be encoded as UTF8 strings. Fine, as they are all byte arrays, UTF encoding is for rendering
- however, since responses are in JSON format, to make the server work for a program client, we have to encode values. I choose `json.dumps`.

- if we will put the code in a docker, the listening port does not matter. To make test easier, we use 9888 in the code.


After thinking over these details, I thought about how to implement the project.

There are 3 major steps:
1. Create a server that can cater multi clients, this is a standard boilerplate
2. Create a Docker, a boilerplate too (we may use docker-compose to define network ports)
3. Implement the key-value datastore, which is the core, consisting of a globle singleton dict
4. a driver that translates text command to method calls
5. Tests
   5.1 for boilerplates, we manually test them along with the development
   5.2 for the kv store, we need test its input, output, execution logic, etc.
     5.2.1 we can even simulate the concurrent clients
   5.3 integration test, we'd better test in a near production environment, and using multiple threads

- we may creat a OperationsInTransaction, any single commands that are not in a transaction will be wrapped up in a transaction in the backend, so that all operations; later I think this is overkill
– if the client buffers transaction content, we can handle all requests atomically

- if we use socket connect and telnet protocol, json format may be not necessary.
Input format and output format are different. This is not very intuitive.
Programmingly, returning byte stream may be even better.

- this is redis cluster, we reinvent the wheels
- in real time, i may partition data, start multi instances of Redis in a single server to leverage multiple cpu cores, and let client talk to specified instance
- we may use zookeeper to keep consistent hashing

# LIFT-backend

<details>
  <summary>Click to expand Neo4j on Docker setup instructions</summary>

## Dockerized Local Neo4j:

✅ Step 1: Install Docker Desktop If you haven't already, download and install
Docker Desktop.

✅ Step 2: Verify That Docker Is Running Run the following command to check if
the Docker daemon is running:

```bash
docker info
```

✅ If Docker is running, you'll see information about your Docker environment.
❌ If you see an error, ensure Docker Desktop is open.

✅ Step 3: Run a Neo4j Container Run the following command to start Neo4j in
Docker:

```bash
docker run --name neo4j \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/thisisthelocalpassword \
  -d neo4j
```

✅ Step 4: Verify That the Container Is Running Check if the Neo4j container is
running:

```bash
docker ps
```

You should see a running neo4j container in the output.

✅ Step 5: Access Neo4j Now, open Neo4j Browser in your browser: 👉
http://localhost:7474

Username: neo4j Password: thisisthelocalpassword (from the Docker command)

✅ Step 6: Connect Your Backend to Neo4j In your .env.local, make sure you have:

```ini
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=thisisthelocalpassword
```

Then restart your backend:

```bash
deno task dev
```

🛠 Extra Commands (If Needed) 🔄 Restart the Neo4j Container:

```bash
docker restart neo4j
```

🛑 Stop the Container:

```bash
docker stop neo4j
```

🚮 Remove the Container (if needed):

```bash
docker rm -f neo4j
```

</details>

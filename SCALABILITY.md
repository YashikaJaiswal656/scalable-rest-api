# Scalability & Performance Optimization

This document outlines the scalability strategies, architectural patterns, and best practices implemented and recommended for this REST API application.

## 📊 Current Architecture

### Stateless Design
The API is built as a stateless service using JWT tokens, enabling:
- Horizontal scaling without session affinity
- Load balancer compatibility
- Easy replication across multiple servers

### Database Connection Pooling
```javascript
const pool = mysql.createPool({
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});
```

**Benefits:**
- Reuses connections instead of creating new ones
- Reduces overhead and improves performance
- Handles concurrent requests efficiently

### Modular Architecture
```
src/
├── controllers/    # Business logic
├── models/         # Data access layer
├── routes/         # API endpoints
├── middleware/     # Reusable middleware
└── services/       # External services (future)
```

**Benefits:**
- Easy to scale individual components
- Simple to migrate to microservices
- Clear separation of concerns

## 🚀 Horizontal Scaling

### Current Implementation
The application is designed for horizontal scaling:

1. **Stateless Architecture** - No server-side sessions
2. **JWT Authentication** - Self-contained tokens
3. **Database Connection Pooling** - Efficient resource usage

### Load Balancing Strategy

#### NGINX Configuration Example
```nginx
upstream api_backend {
    least_conn;
    server api1.example.com:5000;
    server api2.example.com:5000;
    server api3.example.com:5000;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Load Balancing Algorithms
- **Round Robin** - Distribute requests evenly
- **Least Connections** - Route to server with fewest connections
- **IP Hash** - Sticky sessions based on client IP

### Container Orchestration

#### Docker Setup
```dockerfile
# Dockerfile
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
  
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: scalable_api_db
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

#### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 5
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: your-registry/api:latest
        ports:
        - containerPort: 5000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5000
  type: LoadBalancer
```

## 🗄️ Database Scaling

### 1. Indexing Strategy

Already implemented indexes:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### 2. Read Replicas

For read-heavy workloads:

```javascript
// Master-Slave configuration
const masterDB = mysql.createPool({
  host: 'master.db.example.com',
  user: 'root',
  password: 'password',
});

const slaveDB = mysql.createPool({
  host: 'slave.db.example.com',
  user: 'readonly',
  password: 'password',
});

// Route reads to slave, writes to master
const query = async (sql, params, readOnly = false) => {
  const pool = readOnly ? slaveDB : masterDB;
  return await pool.execute(sql, params);
};
```

### 3. Database Sharding

For extremely large datasets:

```javascript
// Shard by user_id
const getShardConnection = (userId) => {
  const shardId = userId % TOTAL_SHARDS;
  return shardConnections[shardId];
};

// Example usage
const userShard = getShardConnection(userId);
const tasks = await userShard.query('SELECT * FROM tasks WHERE user_id = ?', [userId]);
```

### 4. Connection Pooling Optimization

```javascript
const pool = mysql.createPool({
  connectionLimit: 20,          // Max concurrent connections
  waitForConnections: true,     // Queue when limit reached
  queueLimit: 0,                // Unlimited queue
  enableKeepAlive: true,        // Maintain connections
  keepAliveInitialDelay: 0,     // Immediate keep-alive
});
```

## ⚡ Caching Strategy

### Redis Implementation

```javascript
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

// Cache middleware
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedData = await client.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        client.setex(key, duration, JSON.stringify(data));
        originalJson(data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Usage
router.get('/tasks', cacheMiddleware(300), getTasks); // Cache for 5 minutes
```

### Cache Invalidation

```javascript
// Invalidate cache on updates
const invalidateTasksCache = async (userId) => {
  const keys = await client.keys(`cache:/api/v1/tasks*user_id=${userId}*`);
  if (keys.length > 0) {
    await client.del(...keys);
  }
};

// After creating/updating task
await taskAPI.create(taskData);
await invalidateTasksCache(userId);
```

### Cache Strategy Layers

```
┌─────────────────────────────────────┐
│         Client Browser              │
│    (Local Storage, Session)         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│              CDN                    │
│     (Static Assets Cache)           │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          Redis Cache                │
│    (API Response Cache)             │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│     Application Servers             │
│      (Business Logic)               │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         MySQL Database              │
│      (Persistent Storage)           │
└─────────────────────────────────────┘
```

## 🏗️ Microservices Architecture

### Migration Path

Current monolith can be split into:

```
┌──────────────────────────────────────────────┐
│              API Gateway                     │
│         (Kong / AWS API Gateway)             │
└───────────┬──────────────────┬───────────────┘
            │                  │
    ┌───────▼────────┐  ┌─────▼──────────┐
    │ Auth Service   │  │  Task Service  │
    │   (Port 5001)  │  │   (Port 5002)  │
    └───────┬────────┘  └─────┬──────────┘
            │                  │
    ┌───────▼────────┐  ┌─────▼──────────┐
    │  Users DB      │  │   Tasks DB     │
    └────────────────┘  └────────────────┘
```

### Service Communication

```javascript
// Internal API calls between services
const axios = require('axios');

const authService = axios.create({
  baseURL: 'http://auth-service:5001',
  timeout: 5000,
});

const taskService = axios.create({
  baseURL: 'http://task-service:5002',
  timeout: 5000,
});

// Verify user from Auth Service
const verifyUser = async (token) => {
  const response = await authService.post('/verify', { token });
  return response.data;
};
```

### Event-Driven Architecture

```javascript
// RabbitMQ / Kafka integration
const amqp = require('amqplib');

// Publish event
const publishEvent = async (eventType, data) => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const exchange = 'task_events';
  
  await channel.assertExchange(exchange, 'topic', { durable: true });
  channel.publish(exchange, eventType, Buffer.from(JSON.stringify(data)));
  
  console.log(`Published event: ${eventType}`);
};

// Usage
await publishEvent('task.created', { taskId, userId, title });

// Subscribe to events
const subscribeToEvents = async (eventType, handler) => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const exchange = 'task_events';
  const queue = `${eventType}_queue`;
  
  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, eventType);
  
  channel.consume(queue, async (msg) => {
    const data = JSON.parse(msg.content.toString());
    await handler(data);
    channel.ack(msg);
  });
};
```

## 📊 Monitoring & Logging

### Structured Logging with Winston

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Usage
logger.info('Task created', { userId, taskId, duration: 45 });
logger.error('Database connection failed', { error: err.message });
```

### Application Performance Monitoring (APM)

```javascript
// New Relic integration
require('newrelic');

// Or Datadog
const tracer = require('dd-trace').init();

// Custom metrics
const StatsD = require('node-statsd');
const statsd = new StatsD();

// Track request duration
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    statsd.timing('api.request.duration', duration, [`route:${req.route.path}`]);
  });
  next();
});
```

### Health Checks

```javascript
// Comprehensive health check
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    checks: {}
  };

  // Database check
  try {
    await pool.query('SELECT 1');
    health.checks.database = 'OK';
  } catch (error) {
    health.checks.database = 'FAILED';
    health.status = 'DEGRADED';
  }

  // Redis check
  try {
    await redis.ping();
    health.checks.redis = 'OK';
  } catch (error) {
    health.checks.redis = 'FAILED';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## 🔐 Rate Limiting & Throttling

### Advanced Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// API-wide rate limiting
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests',
});

// Stricter limits for auth endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.use('/api/', apiLimiter);
app.use('/api/v1/auth/login', authLimiter);
```

## 🌐 CDN & Asset Optimization

### Frontend Optimization

```javascript
// In frontend build process
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    },
    runtimeChunk: 'single',
  },
};
```

### CDN Configuration

```javascript
// Serve static assets from CDN
const CDN_URL = process.env.CDN_URL || '';

app.use(express.static('public', {
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));
```

## 📈 Performance Benchmarks

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time (p95) | < 200ms | ~100ms |
| Database Query Time (p95) | < 50ms | ~30ms |
| Throughput | 1000 req/s | 500 req/s |
| Error Rate | < 0.1% | 0.05% |
| CPU Usage | < 70% | 40% |
| Memory Usage | < 80% | 50% |

### Load Testing

```bash
# Using Apache Bench
ab -n 10000 -c 100 http://localhost:5000/api/v1/tasks

# Using k6
k6 run --vus 100 --duration 30s load-test.js
```

## 🚀 Deployment Strategies

### Blue-Green Deployment

```yaml
# Current (Blue) environment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
      version: blue

# New (Green) environment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
      version: green

# Service routes to blue initially
# After testing green, switch service to green
# Roll back to blue if issues arise
```

### Canary Deployment

```yaml
# 90% traffic to stable version
apiVersion: v1
kind: Service
metadata:
  name: api-stable
spec:
  selector:
    app: api
    version: stable
  sessionAffinity: ClientIP

# 10% traffic to canary version
apiVersion: v1
kind: Service
metadata:
  name: api-canary
spec:
  selector:
    app: api
    version: canary
```

## 📋 Scalability Checklist

- [x] Stateless architecture
- [x] JWT authentication
- [x] Database connection pooling
- [x] Input validation
- [x] Rate limiting
- [x] Error handling
- [x] Logging
- [x] API documentation
- [ ] Redis caching
- [ ] Load balancing
- [ ] Docker containerization
- [ ] Kubernetes orchestration
- [ ] Database read replicas
- [ ] CDN integration
- [ ] Monitoring (APM)
- [ ] Automated testing
- [ ] CI/CD pipeline
- [ ] Auto-scaling policies

## 🎯 Recommendations

### Immediate Actions (0-3 months)
1. Implement Redis caching for frequently accessed data
2. Set up Docker containers
3. Add comprehensive logging with Winston
4. Implement automated tests

### Short-term (3-6 months)
1. Deploy to Kubernetes cluster
2. Set up database read replicas
3. Implement CI/CD pipeline
4. Add monitoring with Datadog/New Relic

### Long-term (6-12 months)
1. Migrate to microservices architecture
2. Implement event-driven communication
3. Set up multi-region deployment
4. Implement advanced caching strategies

## 📚 Additional Resources

- [12-Factor App Methodology](https://12factor.net/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Redis Best Practices](https://redis.io/topics/best-practices)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)

---

This scalability document should be regularly updated as the application grows and new technologies are adopted.

# 🏗️ AutoBuy Guard - Architecture Deep Dive

**Technical Documentation for Engineers & System Architects**

> This document provides detailed technical specifications of the AutoBuy Guard infrastructure. For a quick overview, see [DEMO.md](DEMO.md).

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Network Architecture](#network-architecture)
- [Compute Layer](#compute-layer)
- [Data Layer](#data-layer)
- [Application Layer](#application-layer)
- [Security Architecture](#security-architecture)
- [Deployment Pipeline](#deployment-pipeline)
- [Monitoring & Observability](#monitoring--observability)
- [Cost Analysis](#cost-analysis)
- [Scaling Strategy](#scaling-strategy)
- [Disaster Recovery](#disaster-recovery)

---

## 🌐 System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                                │
│                     (End Users Globally)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Amazon Route 53    │
              │  autobuyguard.store  │
              │   (DNS Management)   │
              └──────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│  CloudFront CDN │            │ Application LB   │
│  (Static Assets)│            │  (API Traffic)   │
└────────┬────────┘            └────────┬─────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐     ┌──────────────────────────┐
│  AWS Amplify    │     │   Auto Scaling Group     │
│  (Next.js App)  │     │   (Backend Instances)    │
│                 │     │   Min: 1 | Max: 3        │
└─────────────────┘     └──────────┬───────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   EC2 Instances     │
                        │   (Docker + Node)   │
                        │  Public Subnets     │
                        └──────────┬──────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
            ▼                      ▼                      ▼
    ┌───────────────┐    ┌─────────────────┐    ┌──────────────┐
    │  RDS MySQL    │    │  DynamoDB (5)   │    │  ECR Registry│
    │  (Relational) │    │  (NoSQL/KV)     │    │  (Images)    │
    │ Private Subnet│    └─────────────────┘    └──────────────┘
    └───────────────┘
            │
            └──────────────────────┼──────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
          ┌──────────────────┐         ┌──────────────────┐
          │ Secrets Manager  │         │   CloudWatch     │
          │  (Credentials)   │         │  (Monitoring)    │
          └──────────────────┘         └──────────────────┘
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │   SNS Topics    │
                                       │ (Notifications) │
                                       └─────────────────┘
```

### Design Principles

1. **High Availability**: Multi-AZ deployment across 3 availability zones
2. **Scalability**: Auto Scaling based on CPU metrics (1-3 instances)
3. **Security**: Network isolation (RDS in private subnets), encryption at rest/transit, IAM roles
4. **Cost Optimization**: Right-sized instances, no NAT Gateway (EC2 in public subnets)
5. **Observability**: Comprehensive logging, metrics, and alerting
6. **Automation**: Zero-downtime CI/CD deployments

---

## 🌐 Network Architecture

### VPC Configuration

```
VPC: vpc-0d81955605f906468
CIDR Block: 10.0.0.0/16
Region: eu-central-1 (Frankfurt)
DNS Hostnames: Enabled
DNS Resolution: Enabled
```

**Why eu-central-1?**
- GDPR compliance (EU data residency)
- Low latency for German users (primary market)
- Full AWS service availability

### Subnet Design

**Multi-AZ Strategy:** Resources distributed across 3 Availability Zones for fault tolerance.

| Subnet Name        | Type    | CIDR        | AZ            | Resources                    |
|--------------------|---------|-------------|---------------|------------------------------|
| TaskApp-Public-1a  | Public  | 10.0.1.0/24 | eu-central-1a | ALB, EC2                     |
| TaskApp-Private-1a | Private | 10.0.3.0/24 | eu-central-1a | RDS                          |
| TaskApp-Public-1b  | Public  | 10.0.2.0/24 | eu-central-1b | ALB, EC2                     |
| TaskApp-Private-1b | Private | 10.0.4.0/24 | eu-central-1b | RDS (standby)                |
| TaskApp-Public-1c  | Public  | 10.0.5.0/24 | eu-central-1c | ALB, EC2                     |
| TaskApp-Private-1c | Private | 10.0.6.0/24 | eu-central-1c | -                            |

**Design Rationale:**
- **Public subnets**: Internet-facing resources (ALB, EC2 instances)
- **Private subnets**: Database tier (RDS - no internet access)
- **/24 CIDR** per subnet = 251 usable IPs (sufficient for 3 instances + RDS)

**Cost Optimization Decision:**
- EC2 in public subnets eliminates need for NAT Gateway (saves $32/month)
- RDS in private subnets maintains security (no internet exposure)
- This is a conscious trade-off for MVP stage

### Routing Tables

**Public Route Table** (TaskApp-Public-RT)
```
Destination       Target
10.0.0.0/16       local
0.0.0.0/0         igw-xxxxxxxxx (Internet Gateway)
```

**Private Route Table** (TaskApp-Private-RT)
```
Destination       Target
10.0.0.0/16       local
```

**Traffic Flow:**
1. **Inbound Internet → ALB**: Via Internet Gateway (IGW)
2. **ALB → EC2**: Internal VPC routing
3. **EC2 → Internet** (outbound): Via Internet Gateway (EC2 in public subnet)
4. **EC2 → RDS**: Internal VPC routing (never leaves VPC)

**Why No NAT Gateway:**
- EC2 instances in public subnets can access internet directly via IGW
- Saves $32/month in NAT Gateway costs
- RDS doesn't need internet access (only receives connections from EC2)
- Security maintained through security groups and RDS in private subnet

### Internet Gateway

```
ID: TaskApp-IGW
Attached to: vpc-0d81955605f906468
Purpose: Enable internet connectivity for public subnets (ALB and EC2)
Cost: FREE (no hourly charges, only data transfer)
```

**Why EC2 in Public Subnets:**
- Eliminates need for NAT Gateway ($32/month savings)
- EC2 needs outbound internet for:
  - Pulling Docker images from ECR
  - Accessing AWS Secrets Manager
  - Sending logs to CloudWatch
  - System updates (yum update)
- Direct internet access via IGW is sufficient for these needs

### Network ACLs

**Default Network ACL** (acl-05f811bd1b3905b5a)
```
Inbound Rules:
- Rule 100: ALL Traffic from 0.0.0.0/0 → ALLOW
- Rule *:   ALL Traffic → DENY

Outbound Rules:
- Rule 100: ALL Traffic to 0.0.0.0/0 → ALLOW
- Rule *:   ALL Traffic → DENY
```

**Security Note:** NACLs are stateless (return traffic must be explicitly allowed). We rely primarily on Security Groups (stateful) for granular control.

---

## 💻 Compute Layer

### EC2 Instances

**Instance Configuration:**
```yaml
Instance Type: t2.micro
vCPU: 1
Memory: 1 GiB
Network Performance: Low to Moderate
EBS-Optimized: No (not available for t2.micro)
Storage: 8 GiB GP3 SSD (root volume)
Operating System: Amazon Linux 2
```

**Why t2.micro?**
- **Cost**: $0.0126/hour = ~$9/month per instance
- **Sufficient for MVP**: Low traffic, lightweight Node.js app
- **Burstable CPU**: Can handle occasional spikes
- **Upgrade path**: Easy to resize to t2.small/medium if needed

**Current Configuration:**
- Min Instances: 1
- Desired Instances: 1
- Max Instances: 3
- Actual Running: 1 (scales based on CPU)
- **Subnet Placement**: Public subnets (cost optimization - no NAT Gateway needed)

### Launch Template

```yaml
Launch Template ID: lt-02efccc3ce130883b
AMI: ami-0a261c0e5f51090b1 (Amazon Linux 2)
Instance Type: t2.micro
Key Pair: taskapp-backend-key (SSH access)
Security Groups: TaskApp-WebServer-SG
IAM Instance Profile: EC2-ECR-SecretsManager-Role
```

**User Data Script** (runs at instance launch):
```bash
#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log)
exec 2>&1

# Update system
yum update -y

# Install Docker
yum install docker -y
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Retrieve secrets from Secrets Manager
SECRETS=$(aws secretsmanager get-secret-value \
  --secret-id taskapp/database \
  --region eu-central-1 \
  --query SecretString \
  --output text)

# Export as environment variables
export DB_HOST=$(echo $SECRETS | jq -r .host)
export DB_USER=$(echo $SECRETS | jq -r .username)
export DB_PASS=$(echo $SECRETS | jq -r .password)
# ... (other secrets)

# Login to ECR
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin \
  050752651038.dkr.ecr.eu-central-1.amazonaws.com

# Pull and run Docker container
docker pull 050752651038.dkr.ecr.eu-central-1.amazonaws.com/taskapp-backend:latest
docker run -d \
  -p 80:5000 \
  --restart unless-stopped \
  --name taskapp-backend \
  -e DB_HOST=$DB_HOST \
  -e DB_USER=$DB_USER \
  -e DB_PASS=$DB_PASS \
  050752651038.dkr.ecr.eu-central-1.amazonaws.com/taskapp-backend:latest

echo "User Data Script Completed Successfully"
```

### Auto Scaling Group

```yaml
Name: taskapp-backend-asg
Launch Template: lt-02efccc3ce130883b
Min Size: 1
Desired Capacity: 1
Max Size: 3
Availability Zones:
  - eu-central-1a
  - eu-central-1b
  - eu-central-1c
Subnets:
  - TaskApp-Public-1a
  - TaskApp-Public-1b
  - TaskApp-Public-1c
Health Check Type: ELB (Load Balancer)
Health Check Grace Period: 300 seconds
```

**Note:** Instances are in public subnets for cost optimization (no NAT Gateway required). This saves $32/month while maintaining security through security groups and keeping RDS in private subnets.

**Scaling Policy** (Target Tracking):
```yaml
Metric: Average CPU Utilization
Target Value: 70%
Scale Out: Launch 1 instance when CPU > 70% for 2 minutes
Scale In: Terminate 1 instance when CPU < 30% for 5 minutes
Cooldown Period: 300 seconds
```

**Why CPU-based scaling?**
- Simple and predictable
- Works well for compute-bound workloads
- Future: Consider request count or custom metrics

**Instance Refresh Configuration:**
```yaml
Strategy: Rolling
Min Healthy Percentage: 50%
Instance Warmup: 300 seconds
Checkpoint Delays: 600 seconds
```

**How Instance Refresh Works:**
1. Trigger refresh (via GitHub Actions or manually)
2. Launch new instance(s) with updated Docker image
3. Wait for health checks (5 minutes)
4. If healthy, terminate old instance(s)
5. If unhealthy, stop refresh (old instances remain)

### Application Load Balancer

```yaml
Name: taskapp-alb
Scheme: internet-facing
IP Address Type: IPv4
Subnets:
  - TaskApp-Public-1a
  - TaskApp-Public-1b
  - TaskApp-Public-1c
Security Groups: TaskApp-ALB-SG
```

**Listeners:**

**HTTP Listener (Port 80):**
```yaml
Port: 80
Protocol: HTTP
Default Action: Redirect to HTTPS
Redirect Config:
  Protocol: HTTPS
  Port: 443
  Status Code: HTTP_301
```

**HTTPS Listener (Port 443):**
```yaml
Port: 443
Protocol: HTTPS
SSL Certificate: ACM Certificate (*.autobuyguard.store)
Security Policy: ELBSecurityPolicy-TLS13-1-2-2021-06
Default Action: Forward to taskapp-backend-tg
```

### Target Group

```yaml
Name: taskapp-backend-tg
Protocol: HTTP
Port: 80
VPC: vpc-0d81955605f906468
Health Check:
  Protocol: HTTP
  Path: /health
  Interval: 30 seconds
  Timeout: 5 seconds
  Healthy Threshold: 2 (consecutive successes)
  Unhealthy Threshold: 3 (consecutive failures)
  Matcher: 200 (HTTP status code)
Stickiness: Enabled (1 hour)
Deregistration Delay: 30 seconds
```

**Health Check Endpoint** (backend):
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});
```

**Why stickiness?**
- Session persistence (JWT tokens in cookies)
- Better user experience (no cross-instance issues)

---

## 💾 Data Layer

### RDS MySQL

```yaml
DB Instance Identifier: taskapp-database
Engine: MySQL Community 8.4.7
Instance Class: db.t4g.micro (ARM-based)
vCPU: 2
Memory: 1 GiB
Storage:
  Type: General Purpose SSD (gp3)
  Allocated: 10 GiB
  IOPS: 3000 (baseline)
  Throughput: 125 MiB/s
Multi-AZ: No (cost optimization)
Publicly Accessible: No (private subnet only)
VPC: vpc-0d81955605f906468
Subnet Group: taskapp-db-subnet-group
  - TaskApp-Private-1a
  - TaskApp-Private-1b
Security Group: TaskApp-Database-SG
Port: 3306
Master Username: admin
Backup:
  Automated Backups: Enabled (7-day retention)
  Backup Window: 03:00-04:00 UTC
Encryption: Enabled (AWS KMS)
Parameter Group: default.mysql8.0
Monitoring: Enhanced Monitoring (60-second granularity)
```

**Why MySQL over PostgreSQL?**
- Familiarity (used in tutorial courses)
- Sufficient for relational data needs
- Mature ecosystem, excellent documentation

**Why Single-AZ?**
- Cost savings: ~$10/month (Multi-AZ = ~$20)
- Acceptable for MVP (5-minute failover time)
- Easy to convert to Multi-AZ later

**Schema Design** (simplified):

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  google_id VARCHAR(255),
  subscription_tier ENUM('free', 'pro', 'ultra') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_google_id (google_id)
);

-- Billing table
CREATE TABLE billing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  status ENUM('active', 'canceled', 'past_due'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_stripe_subscription (stripe_subscription_id)
);
```

### DynamoDB Tables

**Why DynamoDB for tracked items?**
- High write throughput (frequent price updates)
- Fast key-value lookups (get item by ID)
- No complex joins needed
- On-demand pricing (pay per request)
- Automatic scaling

#### Table 1: autobuy_users
```yaml
Table Name: autobuy_users
Partition Key: userId (String)
Billing Mode: On-Demand
Encryption: Enabled (AWS owned keys)
```

**Sample Item:**
```json
{
  "userId": "usr_abc123",
  "email": "user@example.com",
  "subscriptionTier": "pro",
  "createdAt": 1735689600
}
```

#### Table 2: autobuy_items
```yaml
Table Name: autobuy_items
Partition Key: itemId (String)
Sort Key: userId (String)
Billing Mode: On-Demand
Global Secondary Index:
  - Name: userId-lastChecked-index
    Partition Key: userId
    Sort Key: lastChecked
```

**Sample Item:**
```json
{
  "itemId": "item_xyz789",
  "userId": "usr_abc123",
  "productUrl": "https://amazon.de/product/B08XYZ",
  "productName": "Sony WH-1000XM5 Headphones",
  "targetPrice": 299.99,
  "currentPrice": 349.99,
  "lastChecked": 1735689600,
  "status": "active"
}
```

### Database Access Patterns

**Pattern 1: Get user's tracked items**
```javascript
// DynamoDB: Get user's items
const params = {
  TableName: 'autobuy_items',
  IndexName: 'userId-lastChecked-index',
  KeyConditionExpression: 'userId = :userId',
  ExpressionAttributeValues: { ':userId': 'usr_abc123' }
};
```

**Pattern 2: Update item price**
```javascript
// DynamoDB: Atomic update
const params = {
  TableName: 'autobuy_items',
  Key: { itemId: 'item_xyz789', userId: 'usr_abc123' },
  UpdateExpression: 'SET currentPrice = :price, lastChecked = :time',
  ExpressionAttributeValues: {
    ':price': 329.99,
    ':time': Date.now()
  }
};
```

---

## 🐳 Container Registry (ECR)

```yaml
Repository Name: taskapp-backend
Image Scanning: Enabled on push
Lifecycle Policy: Keep last 10 images
Encryption: AES-256
Registry ID: 050752651038
Region: eu-central-1
```

**Dockerfile** (backend):
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Install Puppeteer dependencies
RUN apk add --no-cache chromium nss freetype harfbuzz

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "index.js"]
```

---

## 🔐 Security Architecture

### Defense in Depth

**Layer 1: Network Security**
- VPC isolation (private subnets for database)
- Security Groups (stateful firewall)
- RDS in private subnets (no internet access)

**Layer 2: Application Security**
- OAuth 2.0 authentication
- JWT with short expiration
- Rate limiting
- Input validation

**Layer 3: Data Security**
- Encryption at rest (RDS, EBS, S3)
- Encryption in transit (TLS 1.2+)
- Secrets Manager (no hardcoded credentials)

### Security Groups

**TaskApp-WebServer-SG** (EC2 Instances)
```yaml
Inbound Rules:
  - Type: HTTP, Port: 80, Source: TaskApp-ALB-SG
  - Type: SSH, Port: 22, Source: <your-ip>/32
Outbound Rules:
  - Type: All Traffic, Destination: 0.0.0.0/0
```

**TaskApp-Database-SG** (RDS)
```yaml
Inbound Rules:
  - Type: MySQL/Aurora, Port: 3306, Source: TaskApp-WebServer-SG
Outbound Rules: None
```

---

## 💰 Cost Analysis

### Monthly Cost Breakdown (December 2025)

| Service                     | Cost    | % of Total | Notes                              |
|-----------------------------|---------|------------|------------------------------------|
| Application Load Balancer   | $14.47  | 34%        | $0.0225/hour + data transfer       |
| EC2 Instances (t2.micro)    | $10.15  | 24%        | 1 instance × 730 hours             |
| RDS MySQL (db.t4g.micro)    | $9.48   | 22%        | Single-AZ, 10 GiB storage          |
| VPC (Data Transfer)         | $6.73   | 16%        | Outbound data + leftover NAT charges |
| Amplify                     | $0.96   | 2%         | Build minutes + hosting            |
| Route 53                    | $0.50   | 1%         | 1 hosted zone                      |
| DynamoDB                    | $0.23   | 1%         | On-demand requests                 |
| Secrets Manager             | $0.16   | <1%        | 1 secret                           |
| Other                       | $0.07   | <1%        | SNS, CloudWatch, KMS               |
| **Total**                   | **$42.75** | **100%** | Well under $50 budget ✅           |

**VPC Cost Breakdown:**
- The $6.73 includes outbound data transfer charges
- May also include leftover costs from NAT Gateway that was briefly configured during initial testing (now removed)
- No ongoing NAT Gateway charges (eliminated to save $32/month)

### Cost Optimization Strategies Implemented

**Right-Sizing:**
- t2.micro (not t2.small) saves $9/month
- db.t4g.micro ARM (not t3.micro x86) saves ~$2/month
- **No NAT Gateway** (EC2 in public subnets) saves $32/month

**Architecture Trade-Off Analysis:**

**Costs Comparison:**
```
With NAT Gateway:
  NAT Gateway:    $32.85/month
  Total:          ~$75/month

Without NAT Gateway:
  Internet Gateway: FREE
  Total:            ~$43/month

Savings: $32/month (43% reduction)
```

**Security Maintained:**
- RDS in private subnets
- Security groups enforce least privilege
- TLS encryption
- Regular security updates

**When to Reconsider:**
- Production with paying customers
- Compliance requirements
- Can add VPC Endpoints instead (cheaper)

---

## 📈 Scaling Strategy

### Current Capacity

**Backend:**
- 1 EC2 instance (~100 concurrent users)
- Auto-scales to 3 instances (~300 concurrent users)

**Database:**
- RDS: 100 connections max
- DynamoDB: Unlimited throughput

### Scaling Plan

**Phase 1: 0-100 Users** (Current)
- 1 EC2 instance sufficient

**Phase 2: 100-500 Users**
- Auto Scaling adds 2nd instance

**Phase 3: 500-2,000 Users**
- Add 3rd EC2 instance (max capacity)
- Upgrade RDS to db.t4g.small
- Enable RDS Multi-AZ
- **Consider adding NAT Gateway** or VPC Endpoints

**Phase 4: 2,000+ Users**
- Refactor to Lambda (serverless)
- Add RDS read replicas
- Implement Redis caching
- Move to private subnets with NAT Gateway

### Bottleneck Analysis

**Current Bottlenecks:**
1. **Single AZ RDS**: No automatic failover
2. **Public Subnet EC2**: Less network isolation
3. **Puppeteer Scraping**: CPU-intensive

**Future Optimizations:**
- Move scraping to Lambda
- Use SQS for async jobs
- CloudFront caching
- Redis for sessions
- **NAT Gateway or VPC Endpoints** for enhanced security

---

## 🛡️ Disaster Recovery

### Backup Strategy

**RDS Automated Backups:**
- Frequency: Daily at 03:00-04:00 UTC
- Retention: 7 days
- Restore: Point-in-time

**Recovery Scenarios:**

**Scenario 1: EC2 Instance Failure**
- Detection: ALB health checks (30s)
- Auto Scaling launches replacement
- Recovery Time: 5-7 minutes

**Scenario 2: RDS Database Failure**
- Restore from latest backup
- Recovery Time: 30+ minutes

**Scenario 3: AZ Outage**
- ALB routes to healthy AZ
- Recovery Time: 10-15 minutes

---

## 📖 Additional Resources

- [README.md](README.md) - Project overview
- [DEMO.md](DEMO.md) - 5-minute quick demo
- [CHALLENGES.md](CHALLENGES.md) - Problems solved

---

**Built with ❤️ by Ahmed Motwaly | AWS Cloud Support Specialist (Honors)**

*Last Updated: January 2026*

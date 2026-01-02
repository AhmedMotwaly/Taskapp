# 🛡️ AutoBuy Guard

**Production-Ready E-commerce Monitoring Platform | Cloud-Native SaaS on AWS**

[![AWS](https://img.shields.io/badge/AWS-Cloud-orange)](https://aws.amazon.com/) [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/) [![Docker](https://img.shields.io/badge/Docker-Containerized-blue)](https://www.docker.com/) [![TypeScript](https://img.shields.io/badge/TypeScript-Type%20Safe-blue)](https://www.typescriptlang.org/)

> **Live Application**: [https://autobuyguard.store](https://autobuyguard.store/)  
> **API Endpoint**: https://api.autobuyguard.store

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [AWS Infrastructure](#aws-infrastructure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Performance Metrics](#performance-metrics)
- [Security Implementation](#security-implementation)
- [Cost Optimization](#cost-optimization)
- [Development Journey](#development-journey)
- [Challenges Overcome](#challenges-overcome)
- [What I Learned](#what-i-learned)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Author](#author)

---

## 🎯 Overview

**AutoBuy Guard** is a production-ready SaaS platform that monitors product prices and availability across major European e-commerce sites. Built from scratch over 2 months, this project demonstrates comprehensive cloud engineering skills including AWS infrastructure design, containerization, CI/CD automation, and full-stack development.

### The Problem

Online shoppers in Europe face two major challenges:

1. **Price Volatility**: Products frequently change prices, and limited-time deals are easy to miss
2. **Stock Availability**: Popular items sell out quickly, requiring constant manual monitoring

### The Solution

AutoBuy Guard provides automated monitoring with instant notifications:

- **Deal Sniper Mode**: Tracks price drops below user-defined thresholds
- **Restock Sniper Mode**: Monitors sold-out items and alerts when back in stock
- **Multi-Platform Support**: Amazon, Zalando, eBay, MediaMarkt/Saturn, Adidas, Nike, Rossmann, and universal scraper for other sites

### Why This Matters

This isn't a tutorial follow-along project—it's a fully functional, EU-compliant SaaS application demonstrating:

- **Production-grade AWS architecture** with auto-scaling and high availability
- **Zero-downtime deployments** using automated CI/CD pipelines
- **Cost optimization** at ~$43/month for complete infrastructure (43% savings by eliminating NAT Gateway)
- **Security best practices** with Secrets Manager, IAM roles, and network isolation
- **Real-world problem solving** including anti-bot detection and OAuth debugging

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
│                    (End Users)                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                   ┌─────────▼─────────┐
                   │   Route 53 DNS    │
                   │ autobuyguard.store│
                   └────────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
    ┌─────────▼──────────┐    ┌──────────▼─────────┐
    │   CloudFront CDN   │    │  Application LB    │
    │    (Frontend)      │    │   (Backend API)    │
    │   d19gwjbn5vhz3u   │    │  taskapp-alb       │
    └─────────┬──────────┘    └──────────┬─────────┘
              │                           │
    ┌─────────▼──────────┐    ┌──────────▼─────────┐
    │   AWS Amplify      │    │  Auto Scaling      │
    │   (Next.js Build)  │    │  Group (Min: 1)    │
    │                    │    │  (Desired: 1)      │
    └────────────────────┘    │  (Max: 3)          │
                              └──────────┬─────────┘
                                         │
                              ┌──────────▼──────────┐
                              │  EC2 Instances    │
                              │  t2.micro         │
                              │  Docker + Node.js │
                              └──────────┬────────┘
                                         │
                       ┌─────────────────┼─────────────────┐
                       │                 │                 │
              ┌────────▼────────┐  ┌────▼─────┐  ┌───────▼────────┐
              │  RDS MySQL      │  │ DynamoDB │  │  ECR Registry  │
              │  db.t4g.micro   │  │ 5 Tables │  │ taskapp-backend│
              │  10 GiB SSD     │  └──────────┘  └────────────────┘
              └─────────────────┘
                       │
              ┌────────┴────────┐
              │                 │
       ┌──────▼──────┐   ┌─────▼──────┐   ┌──────────────┐
       │   Secrets   │   │ CloudWatch │   │     SNS      │
       │   Manager   │   │ Monitoring │   │Notifications │
       └─────────────┘   └────────────┘   └──────────────┘

VPC: 10.0.0.0/16 across 3 Availability Zones
├── eu-central-1a: Public & Private Subnets
├── eu-central-1b: Public & Private Subnets  
└── eu-central-1c: Public & Private Subnets

**Network Design:**
- ALB: Public subnets (internet-facing)
- EC2: Public subnets (cost optimization - no NAT Gateway)
- RDS: Private subnets (secure, no internet access)
```

### Infrastructure Highlights

- **Multi-AZ Deployment**: Resources distributed across 3 availability zones for high availability
- **Network Isolation**: VPC with separate public/private subnets, security groups controlling all traffic
- **Cost-Optimized Networking**: EC2 in public subnets (no NAT Gateway costs), RDS in private subnets (secure)
- **Auto Scaling**: Dynamic capacity (1-3 instances) based on CPU utilization
- **Load Balancing**: Application Load Balancer with health checks for traffic distribution
- **Containerization**: Docker images stored in ECR, pulled by EC2 instances at launch
- **CI/CD Automation**: GitHub Actions workflow for zero-downtime deployments

---

## ✨ Key Features

### 🎯 Dual Monitoring Modes

**Deal Sniper**
- Track up to unlimited products (tier-dependent)
- Set custom target prices
- Automatic price checks every 6-24 hours
- Instant email/SMS alerts on price drops
- Historical price tracking

**Restock Sniper**
- Monitor out-of-stock items
- Variant detection (size, color, model)
- Intelligent "Notify Me" button handling
- Immediate alerts when items return to stock
- Support for dynamic product pages

### 🌍 Multi-Platform Support

| Platform | Status | Special Features |
|----------|--------|------------------|
| **Amazon** | ✅ Active | Anti-bot evasion, dynamic pricing |
| **Zalando** | ✅ Active | Complex variant detection (v13.1) |
| **eBay** | ✅ Active | Auction monitoring |
| **MediaMarkt/Saturn** | ✅ Active | German electronics retailer |
| **Adidas** | ✅ Active | Shell page detection |
| **Nike** | ✅ Active | Anti-bot measures |
| **Rossmann** | ✅ Active | German drugstore chain |
| **Universal Scraper** | ✅ Active | Fallback for unsupported sites |

### 💎 Pricing Tiers

| Feature | Free | Pro (€5/mo) | Ultra (€10/mo) |
|---------|------|-------------|----------------|
| **Check Frequency** | 24 hours | 12 hours | 6 hours |
| **Deal Sniper Items** | 1 | 10 | Unlimited |
| **Restock Sniper Items** | 1 | 10 | Unlimited |
| **SMS Alerts** | ❌ | ✅ | ✅ |
| **Browser Extension** | ✅ | ✅ | ✅ |
| **Priority Support** | ❌ | ✅ | ✅ |

### 🔐 Authentication & Security

- **Google OAuth2** integration via NextAuth.js
- **JWT-based** session management
- **Encrypted secrets** stored in AWS Secrets Manager
- **HTTPS/TLS** encryption on all endpoints
- **GDPR-compliant** data handling

---

## 💻 Technology Stack

### Frontend Architecture

```typescript
Next.js 14 (App Router)     // Server-side rendering, file-based routing
├── TypeScript              // Type safety, better DX
├── Tailwind CSS            // Utility-first styling
├── Shadcn UI               // Accessible component library
├── NextAuth.js             // Authentication
└── Lucide React            // Icon system
```

**Key Technical Decisions:**

- **App Router over Pages Router**: Better performance with React Server Components
- **TypeScript**: Catch errors at compile-time, improve IDE experience
- **Tailwind CSS**: Rapid development without custom CSS files
- **Server/Client Component Split**: Avoid SSR hydration issues with 'use client' directive

### Backend Architecture

```javascript
Node.js + Express.js        // RESTful API server
├── Puppeteer (Stealth)     // Headless browser for scraping
├── JWT                     // Stateless authentication
├── MySQL (RDS)             // Relational data (users, billing)
├── DynamoDB                // NoSQL (tracked items, fast lookups)
├── Stripe SDK              // Payment processing
├── Nodemailer              // Email notifications
└── Twilio                  // SMS alerts
```

**Key Technical Decisions:**

- **Puppeteer over Cheerio**: Handle JavaScript-rendered content and anti-bot measures
- **Hybrid Database**: RDS for relational data, DynamoDB for high-throughput item tracking
- **Containerization**: Docker ensures consistency across dev/staging/prod
- **Express.js**: Lightweight, flexible middleware system

### DevOps & Infrastructure

```yaml
GitHub Actions              # CI/CD automation
├── Docker                  # Application containerization
├── AWS ECR                 # Private container registry
├── AWS EC2 + ASG           # Compute with auto-scaling
├── Application Load Balancer # Traffic distribution
├── Route 53                # DNS management
├── CloudWatch              # Logging and monitoring
└── SNS                     # Alerting system
```

---

## ☁️ AWS Infrastructure

### Core Services Configuration

#### **Compute Layer**

**EC2 Instances**
- Instance Type: t2.micro (1 vCPU, 1 GiB RAM)
- Operating System: Amazon Linux 2
- Launch Template: lt-02efccc3ce130883b
- User Data: Automated Docker container deployment

**Auto Scaling Group**
- Name: taskapp-backend-asg
- Scaling Policy: Target tracking based on CPU utilization
- Min Capacity: 1 instance
- Desired Capacity: 1 instance
- Max Capacity: 3 instances
- Health Check Type: ELB (300s grace period)
- Instance Refresh: Rolling updates with 50% healthy minimum

**Application Load Balancer**
- Name: taskapp-alb
- Scheme: Internet-facing
- Listeners:
  - HTTP:80 → HTTPS:443 redirect
  - HTTPS:443 → Target Group (SSL: ACM Certificate)
- Health Check: /health endpoint, 30s interval
- Stickiness: Enabled (1 hour)

#### **Networking Layer**

**VPC Configuration**
- CIDR Block: 10.0.0.0/16
- DNS Hostnames: Enabled
- DNS Resolution: Enabled

**Subnets** (6 total across 3 AZs)

| Subnet | Type | CIDR | AZ | Purpose |
|--------|------|------|----|---------| 
| TaskApp-Public-1a | Public | 10.0.1.0/24 | eu-central-1a | ALB, EC2 |
| TaskApp-Private-1a | Private | 10.0.3.0/24 | eu-central-1a | RDS |
| TaskApp-Public-1b | Public | 10.0.2.0/24 | eu-central-1b | ALB, EC2 |
| TaskApp-Private-1b | Private | 10.0.4.0/24 | eu-central-1b | RDS |
| TaskApp-Public-1c | Public | 10.0.5.0/24 | eu-central-1c | ALB, EC2 |
| TaskApp-Private-1c | Private | 10.0.6.0/24 | eu-central-1c | EC2 |

**Route Tables (2 total)**

- **TaskApp-Public-RT**: Routes to Internet Gateway (0.0.0.0/0 → IGW)
- **TaskApp-Private-RT**: Local VPC traffic only (RDS has no internet access)

**Internet Access:**
- **Public Subnets**: Direct internet via Internet Gateway (for ALB and EC2)
- **Private Subnets**: No internet access (RDS isolation for security)

**Security Groups**

| Security Group | Inbound Rules | Purpose |
|----------------|---------------|---------|
| **TaskApp-ALB-SG** | HTTP (80), HTTPS (443) from 0.0.0.0/0 | Allow public web traffic |
| **TaskApp-WebServer-SG** | HTTP (80) from ALB-SG, SSH (22) from specific IP | EC2 instances (public subnet) |
| **TaskApp-Database-SG** | MySQL (3306) from WebServer-SG | RDS access control (private subnet) |

**Architecture Note:** EC2 instances are in public subnets for cost optimization (no NAT Gateway needed). RDS remains in private subnets with no internet access for security.

#### **Database Layer**

**RDS MySQL**
- Instance Class: db.t4g.micro (2 vCPUs, 1 GiB RAM)
- Engine: MySQL Community 8.4.7
- Storage: 10 GiB SSD (General Purpose)
- Backup Retention: 7 days
- Multi-AZ: No (cost optimization for MVP)
- Encryption: Enabled (AWS KMS)
- Subnet Group: taskapp-db-subnet-group (Private subnets)

**DynamoDB Tables** (5 tables)
- **autobuy_users**: User accounts and profiles
- **autobuy_items**: Deal Sniper tracked products
- **autobuy_restockItems**: Restock Sniper monitored items
- **autobuy_subscriptions**: Stripe subscription data
- **autobuy_billing**: Payment history

**Why Hybrid Database?**
- **RDS**: Complex queries, transactions, user authentication
- **DynamoDB**: High-throughput item tracking, fast key-value lookups

#### **Container Registry**

**AWS ECR**
- Repository: taskapp-backend
- Image Scanning: Enabled on push
- Lifecycle Policy: Keep last 10 images
- Encryption: AES-256
- Latest Image Size: 713.24 MB

#### **DNS & CDN**

**Route 53**
- Hosted Zone: autobuyguard.store
- Records:
  - A (root) → CloudFront distribution
  - CNAME (www) → CloudFront distribution
  - CNAME (api) → Application Load Balancer
  - MX → PrivateEmail.com (Namecheap)
  - TXT → SPF record for email validation
  - NS → AWS nameservers

**CloudFront**
- Distribution ID: d19gwjbn5vhz3u
- Origin: AWS Amplify (frontend)
- Caching: Static assets (CSS/JS) cached 1 year
- SSL/TLS: ACM certificate (*.autobuyguard.store)

**AWS Amplify**
- Framework: Next.js 14
- Build Time: ~3 minutes
- Auto-Deploy: On push to main branch
- App Root: frontend/
- Environment Variables: Injected at build time

#### **Secrets Management**

**AWS Secrets Manager**
- Secret Name: taskapp/database
- Stored Credentials:
  - Database connection (host, port, username, password)
  - JWT signing secret
  - Stripe API keys (secret, publishable)
  - Email service credentials
  - NextAuth secret
  - Google OAuth client ID & secret
- Rotation: Manual (planned automation)
- Cost: $0.16/month

#### **Monitoring & Logging**

**CloudWatch Dashboards** (2 total)
- **taskapp-monitoring**: CPU, memory, network metrics
- **TaskApp-Deployment-Monitor**: Instance count, response times, error rates

**CloudWatch Alarms**
- **Monthly-Bill-Over-20**: Billing alert ($20 threshold)

**CloudWatch Logs**
- Log Group: /aws/ec2/taskapp-backend
- Retention: 7 days
- Log Streams: One per EC2 instance

**SNS Topics** (2 total)
- **billing-alerts**: Cost monitoring notifications
- **taskapp-deployment-notifications**: CI/CD alerts

---

## 🔄 CI/CD Pipeline

### Automated Deployment Workflow

**Trigger Conditions:**
```yaml
on:
  push:
    branches: [main]
    paths: ['backend/**']
  workflow_dispatch:  # Manual trigger option
```

### Pipeline Stages

#### **Stage 1: Testing** (~2-3 minutes)
```
1. Checkout code from GitHub
2. Setup Node.js 20 environment
3. Install dependencies (npm ci)
4. Run unit tests
5. Run ESLint (code quality)
6. ✅ Pass → Continue | ❌ Fail → Stop deployment
```

#### **Stage 2: Build & Push** (~4-6 minutes)
```
1. Authenticate with AWS
2. Login to Amazon ECR
3. Build Docker image:
   - Base: node:20-alpine
   - Platform: linux/amd64
   - Tags: [commit-sha, latest]
4. Push both tags to ECR
5. Generate deployment artifact
```

#### **Stage 3: Deploy** (~10-15 minutes)
```
1. Trigger Auto Scaling Group instance refresh
2. Launch new EC2 instances:
   - Pull latest image from ECR
   - Inject secrets from Secrets Manager
   - Start Docker container
3. Health check loop (30 attempts):
   - Query ALB target health
   - Check /health endpoint
   - Verify 200 OK response
4. If healthy → Terminate old instances
5. If unhealthy → Rollback automatically
```

#### **Stage 4: Notification**
```
1. SNS publishes message:
   - ✅ Success → Email with deployment details
   - ❌ Failure → Email with error logs
2. CloudWatch logs archived
```

### Rollback Strategy

**Automatic Rollback Triggers:**
- Health check failures (3 consecutive)
- Instance launch failures
- Docker container crashes
- API response errors (5xx)

**Manual Rollback:**
```bash
# Option 1: Via GitHub Actions
gh workflow run rollback-backend.yml --field commit_sha=abc123

# Option 2: Via AWS Console
aws autoscaling cancel-instance-refresh \
  --auto-scaling-group-name taskapp-backend-asg
```

### Deployment Best Practices Implemented

- ✅ **Immutable Infrastructure**: New instances, never patched
- ✅ **Blue-Green Deployments**: Rolling updates with 50% healthy minimum
- ✅ **Canary Releases**: Ready (set percentage of traffic to new version)
- ✅ **Rollback Capability**: < 5 minutes to previous stable version
- ✅ **Zero Downtime**: Load balancer maintains service during updates
- ✅ **Audit Trail**: Every deployment logged in CloudWatch

---

## 📊 Performance Metrics

### Production Performance (December 2025)

| Metric | Value | Benchmark | Status |
|--------|-------|-----------|--------|
| **API Response Time** | 1.3ms | < 100ms | ⚡ Excellent |
| **Frontend Load Time** | 2.26s total | < 3s | ✅ Good |
| **DOMContentLoaded** | 288ms | < 500ms | ⚡ Excellent |
| **Load Event** | 542ms | < 1s | ⚡ Excellent |
| **Scraping Time** | 15 seconds | < 30s | ✅ Good |
| **Monthly AWS Cost** | $42.75 | < $50 | 💰 Optimized |
| **Current Users** | 3 | N/A | 📈 Growing |
| **Products Tracked** | 2 | N/A | 📦 Active |

### Infrastructure Efficiency

**Auto Scaling Behavior:**
- Scales out: CPU > 70% for 2 minutes
- Scales in: CPU < 30% for 5 minutes
- Cooldown: 300 seconds between scaling activities

**Database Performance:**
- RDS Query Time: < 50ms (average)
- DynamoDB Read Latency: < 10ms
- DynamoDB Write Latency: < 15ms

**Cost Breakdown:**
```
EC2 Instances:             $10.15 (24%)
Application Load Balancer: $14.47 (34%)
RDS MySQL:                 $9.48  (22%)
VPC (Data Transfer):       $6.73  (16%)  ← Outbound data + leftover NAT charges
DynamoDB:                  $0.50  (1%)
Other Services:            $1.42  (3%)
------------------------
Total:                     $42.75/month
```

**VPC Cost Note:** The $6.73 includes outbound data transfer charges and potential leftover costs from a NAT Gateway that was configured for a few days during initial testing (since removed).

---

## 🔐 Security Implementation

### Defense in Depth Strategy

#### **Network Security**

**VPC Isolation**
- Private subnets for database (no internet access)
- Public subnets for compute (cost optimization trade-off)
- Security groups restrict all traffic (principle of least privilege)
- RDS completely isolated from internet exposure

**Security Group Rules**
```
Internet → ALB:           80, 443 (HTTPS only in production)
ALB → EC2:                80 (internal traffic)
EC2 → RDS:                3306 (database access, internal VPC only)
Admin → EC2:              22 (SSH from whitelisted IP only)
```

**Network Design Decision:**
- EC2 in public subnets eliminates need for NAT Gateway ($32/month savings)
- RDS in private subnets maintains security (no internet exposure)
- All inter-VPC communication stays internal (never touches internet)
- This is a conscious cost vs. security trade-off for MVP stage

**Network ACLs**
- Stateless firewall rules at subnet level
- Deny inbound traffic from known malicious IPs
- Allow outbound HTTPS for API calls

#### **Application Security**

**Authentication & Authorization**
- OAuth 2.0 (Google) for user authentication
- JWT tokens with 24-hour expiration
- HTTP-only cookies (prevents XSS)
- CSRF protection on state-changing operations

**API Security**
- Rate limiting: 100 requests/15 minutes per IP
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS protection (sanitize user input)

**Secrets Management**
- Zero secrets in code or environment variables
- AWS Secrets Manager for all credentials
- Automatic rotation capability (planned)
- IAM roles for EC2 to access secrets (no hardcoded keys)

#### **Data Protection**

**Encryption at Rest**
- RDS: AWS KMS encryption
- EBS Volumes: Encrypted
- S3 Buckets: Server-side encryption
- Secrets Manager: AES-256 encryption

**Encryption in Transit**
- TLS 1.2+ on all connections
- ACM-managed SSL certificates
- HTTPS redirect on ALB

**Data Privacy (GDPR Compliance)**
- User data stored in eu-central-1 (Frankfurt)
- Data deletion on request (right to be forgotten)
- Privacy policy and cookie consent
- Data processing agreement available

#### **IAM Best Practices**

**EC2 Instance Role:**
```json
{
  "Effect": "Allow",
  "Action": [
    "ecr:GetAuthorizationToken",
    "ecr:BatchGetImage",
    "secretsmanager:GetSecretValue",
    "logs:CreateLogStream",
    "logs:PutLogEvents"
  ],
  "Resource": "*"
}
```

**Principle of Least Privilege:**
- No wildcard permissions in production
- Separate roles for dev/staging/prod
- MFA required for admin access

---

## 💰 Cost Optimization

### Optimization Strategies Implemented

**Right-Sizing Compute:**
- t2.micro for backend (sufficient for MVP traffic)
- db.t4g.micro for RDS (ARM-based, 20% cheaper)
- EC2 in public subnets (eliminates $32/month NAT Gateway cost)

**Cost-Conscious Architecture:**
- **No NAT Gateway** - EC2 uses Internet Gateway directly (saves $32/month)
- RDS Single-AZ (not Multi-AZ) saves ~$10/month
- DynamoDB on-demand pricing (no reserved capacity)
- CloudWatch log retention: 7 days (not indefinite)
- ECR lifecycle policy: Keep only 10 images

**Free Tier Usage:**
- AWS Amplify: First 1,000 build minutes free
- Route 53: First hosted zone $0.50/month
- CloudWatch: 5GB logs, 10 metrics free
- SNS: 1,000 email notifications free

### Network Architecture Trade-Off

**Decision:** EC2 instances in public subnets (not private with NAT Gateway)

**Reasoning:**
- NAT Gateway costs $32/month ($0.045/hour + data transfer)
- Would increase total costs from $42.75 → $75 (43% increase)
- For MVP with low traffic, this cost isn't justified

**Security Maintained:**
- RDS remains in private subnets (no internet exposure)
- Security groups restrict all traffic
- TLS encryption on all connections
- Rate limiting on API endpoints
- Regular security updates

**When to Add NAT Gateway:**
For production with paying customers, consider adding NAT Gateway or VPC endpoints for enhanced security isolation of compute resources.

### Potential Further Optimizations

**For Higher Traffic:**
- Reserved Instances: 30-50% savings on EC2
- Savings Plans: Commit to 1-3 year usage
- CloudFront: Caching reduces backend load
- RDS Read Replicas: Offload read queries
- VPC Endpoints: Private connectivity to AWS services (alternative to NAT Gateway)

**For Lower Traffic:**
- Lambda for backend (serverless, pay-per-use)
- Aurora Serverless: Scales to zero
- S3 static hosting: Cheaper than Amplify for static sites

**For Enhanced Security:**
- Move EC2 to private subnets + add NAT Gateway (adds $32/month)
- Or use VPC Endpoints for S3, ECR, Secrets Manager (cheaper than NAT Gateway)
- Enable Multi-AZ for RDS (adds ~$10/month)

---

## 🚀 Development Journey

### Timeline (October - December 2025)

**Phase 1: Concept & Architecture** (Week 1-2)
- Defined problem: Price tracking for EU shoppers
- Decided against auto-purchase (GDPR/PSD2 compliance)
- Designed dual-mode system (Deal + Restock Sniper)
- Selected AWS over Heroku for infrastructure showcase

**Phase 2: MVP Development** (Week 3-5)
- Built Next.js frontend with Tailwind CSS
- Implemented Express backend with Puppeteer
- Created basic Amazon/Zalando scrapers
- Set up RDS + DynamoDB hybrid database

**Phase 3: AWS Infrastructure** (Week 6-7)
- Designed VPC with public/private subnets
- Configured Auto Scaling Group + Load Balancer
- Dockerized backend, pushed to ECR
- Deployed frontend to Amplify

**Phase 4: CI/CD Pipeline** (Week 7-8)
- Built GitHub Actions workflow
- Implemented zero-downtime deployments
- Added health checks and rollback logic
- Set up CloudWatch monitoring

**Phase 5: Anti-Bot Evasion** (Week 8-9)
- Iterated scraper logic through v13.1
- Added Puppeteer stealth plugin
- Implemented shell page detection
- Enhanced variant detection for Zalando

**Phase 6: Polish & Production** (Week 9-10)
- Added authentication (NextAuth + Google OAuth)
- Integrated Stripe for payments
- Implemented email/SMS notifications
- Created legal pages (GDPR, Privacy, Terms)
- Cost optimization and final testing

---

## 🏆 Challenges Overcome

### Technical Hurdles & Solutions

#### **Challenge 1: Next.js SSR Hydration Errors**

**Problem:**
```javascript
// This code caused errors:
const [items, setItems] = useState([]);
useEffect(() => {
  const saved = localStorage.getItem('items');
  setItems(JSON.parse(saved));
}, []);
```

Error: "localStorage is not defined" during server-side rendering.

**Solution:** Split components into server and client:

```typescript
// page.tsx (Server Component)
export default function DashboardPage() {
  return <DashboardClient />;
}

// DashboardClient.tsx (Client Component)
'use client';
export default function DashboardClient() {
  // Now localStorage works!
}
```

**Learning:** Understanding Next.js App Router's rendering lifecycle is crucial.

---

#### **Challenge 2: OAuth2 Domain Mismatch**

**Problem:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://autobuyguard.store/api/auth/callback/google
Does not match a registered redirect URI
```

**Root Cause:** Inconsistent domain usage (sometimes www., sometimes not).

**Solution:**
1. Standardized to https://www.autobuyguard.store everywhere:
   - .env → NEXTAUTH_URL=https://www.autobuyguard.store
   - Google Cloud Console redirect URIs
   - Amplify environment variables
2. Added Route 53 alias record for both root and www
3. Rebuilt Amplify app to inject updated env vars

**Learning:** OAuth is environment-sensitive. Consistency across 3+ configuration points is critical.

---

#### **Challenge 3: Adidas Anti-Bot Detection**

**Problem:** Scraper returned shell pages with no product data:

```javascript
{
  title: "adidas",
  price: "€0.00",
  available: false  // False positive!
}
```

**Root Cause:** Adidas detects headless browsers and serves blank pages.

**Solution Evolution:**

```javascript
// v1.0: Basic scraping (failed)
const html = await page.content();

// v3.0: Added waiting for dynamic content
await page.waitForSelector('.product-price');

// v5.2: Shell page detection (current)
const hasImage = await page.$('img[alt*="product"]');
const hasPrice = await page.$('.price-value');
if (!hasImage || !hasPrice) {
  throw new Error('Shell page detected');
}
```

**Learning:** Modern e-commerce sites require multi-layer validation, not just content extraction.

---

#### **Challenge 4: Auto Scaling Health Check Failures**

**Problem:** New EC2 instances launched but immediately marked unhealthy by ALB.

**Root Cause:** User Data script had syntax error, Docker container crashed silently.

**Solution:**

1. Added comprehensive logging to User Data:
```bash
#!/bin/bash
set -e  # Exit on any error
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "=== Starting User Data Script ==="
# ... rest of script
```

2. Verified health check endpoint in backend:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
```

3. Increased ALB health check grace period: 30s → 300s

**Learning:** Invisible failures are the hardest to debug. Comprehensive logging is non-negotiable.

---

#### **Challenge 5: GitHub Actions Submodule Issues**

**Problem:**
```bash
git push origin main
# Backend and Frontend folders showed as empty on GitHub!
```

**Root Cause:** Folders contained hidden .git directories, Git treated them as submodules.

**Solution:**
```bash
# Remove submodule cache
git rm --cached Backend Frontend

# Delete hidden .git folders
rm -rf Backend/.git Frontend/.git

# Rename to lowercase (Git cache reset)
mv Backend backend-temp && mv backend-temp backend

# Re-add as normal folders
git add backend/ frontend/
git commit -m "Fix: Convert submodules to regular folders"
git push --force
```

**Learning:** Hidden files (.git) can cause silent failures. Always verify Git's tracking with `git ls-tree`.

---

## 🎓 What I Learned

### Cloud Architecture

**Before This Project:**
- Knew AWS services theoretically (passed certification)
- No experience designing complete systems
- Uncertain about networking (VPCs, subnets, routing)

**After This Project:**
- Can design multi-tier, highly available architectures
- Understand trade-offs: cost vs. availability vs. performance
- Comfortable with VPC networking and security groups
- Know when to use services (RDS vs. DynamoDB, EC2 vs. Lambda)

### DevOps & CI/CD

**Key Takeaways:**
- **Automation is worth the upfront time investment** — Manual deployments are error-prone and time-consuming
- **Health checks are critical** — Without them, broken code goes straight to production
- **Rollback capability is mandatory** — Deployments will fail; recovery speed matters
- **Monitoring isn't optional** — You can't fix what you can't see

### Full-Stack Development

**Frontend (Next.js):**
- Server Components vs. Client Components (when to use each)
- Static generation vs. server-side rendering trade-offs
- Managing authentication state across client/server boundary

**Backend (Node.js + Express):**
- Puppeteer for complex scraping scenarios
- When to cache vs. re-fetch data
- Database schema design (normalized vs. denormalized)

### Cost Consciousness

**Lessons Learned:**
- Free tier goes further than expected
- Small choices compound (t2.micro vs. t2.small = $8/month)
- NAT Gateway is expensive ($32/month) - eliminated for MVP
- Monitoring costs matter (CloudWatch log retention)
- **Trade-offs are necessary**: Perfect security vs. practical budget

**Key Principle:** Start small, scale based on actual usage, not anticipated usage.

**Real-World Decision:** 
Placing EC2 in public subnets (no NAT Gateway) saved 43% on monthly costs ($75 → $42.75). While not ideal for high-security production, it's a pragmatic choice for an MVP that maintains security through other layers (security groups, TLS, rate limiting, private DB).

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker installed
- AWS CLI configured
- Git

### Local Development

**1. Clone Repository:**
```bash
git clone https://github.com/AhmedMotwaly/Taskapp.git
cd Taskapp
```

**2. Backend Setup:**
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Add your credentials to .env
# Then start development server
npm run dev
```

**3. Frontend Setup:**
```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

**4. Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

### Environment Variables

**Backend (.env):**
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=your_rds_endpoint
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
```

**Frontend (.env.local):**
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_API_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 📁 Project Structure

```
Taskapp/
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── config/          # Database, Stripe configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   │   └── scrapers/    # Site-specific scrapers
│   │   └── utils/           # Helper functions
│   ├── Dockerfile           # Container definition
│   ├── package.json
│   └── index.js             # Entry point
│
├── frontend/                 # Next.js React Application
│   ├── app/                 # App Router pages
│   │   ├── dashboard/       # Protected dashboard routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── (legal pages)
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── ...
│   ├── lib/                # Utilities
│   ├── public/             # Static assets
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy-backend.yml  # CI/CD pipeline
│
├── docs/                    # Screenshots, diagrams
├── README.md
└── .gitignore
```

---

## 👨‍💻 Author

**Ahmed Motwaly**  
*Cloud Support Specialist | AWS Certified*

📧 Email: ahmad.farouk@live.com  
🔗 LinkedIn: [linkedin.com/in/ahmed-motwaly](https://linkedin.com/in/ahmed-motwaly)  
🐙 GitHub: [@AhmedMotwaly](https://github.com/AhmedMotwaly)  
🌐 Portfolio: [autobuyguard.store](https://autobuyguard.store/)

### Certifications

- **AWS Cloud Support Specialist** — Correlation One (Honors) | August 2025
- **AWS Cloud Quest: Cloud Practitioner** — Amazon Web Services | August 2025
- **AWS Educate**: Networking, Security, Databases, Storage, Compute | 2025

### About Me

I'm a career changer transitioning into cloud engineering after completing the Correlation One AWS Cloud Support Specialist program with honors. This project represents 2 months of intensive learning, problem-solving, and hands-on AWS infrastructure design.

**What I bring:**

- Proven ability to learn complex technical systems quickly
- Real-world cloud architecture experience (not just certification knowledge)
- Problem-solving mindset demonstrated through scraper anti-bot evasion
- Cost-conscious approach to infrastructure design
- Full-stack perspective (understand both dev and ops needs)

**Currently seeking:** Cloud Support Engineer or Junior Cloud Operations roles in Germany.

---

## 📄 License

This project is for portfolio demonstration purposes.

---

## 🙏 Acknowledgments

- **Correlation One** — For comprehensive AWS training program
- **AWS Documentation** — Invaluable resource for learning services
- **Next.js Team** — For excellent framework and documentation
- **Puppeteer Community** — For anti-bot detection solutions

---

## 📸 Screenshots

*Screenshots will be added to* `/docs` *folder:*

- `/docs/landing-page.png` — Homepage hero section
- `/docs/dashboard.png` — User dashboard with tracked items
- `/docs/cloudwatch-dashboard.png` — Infrastructure monitoring
- `/docs/github-actions.png` — Successful CI/CD pipeline run
- `/docs/aws-architecture.png` — Annotated architecture diagram

---

**⭐ If this project helped you understand AWS infrastructure or CI/CD pipelines, please consider giving it a star!**

*Built with ❤️ in Germany | Deployed on AWS eu-central-1 | GDPR Compliant*

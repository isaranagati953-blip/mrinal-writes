# Deployment Guide

## Step 1 — Domain + Cloudflare
1. Buy a generic domain (e.g. quietnotes.in, arjunsharma.in)
2. Add to Cloudflare (free) → point domain nameservers to Cloudflare
3. SSL/TLS → Full (strict) mode
4. Origin Server → Create Certificate → save both files

## Step 2 — Cloudflare R2 bucket
1. R2 → Create bucket → generic name → Default encryption ON → NO public access
2. R2 → API Tokens → Create token (Object Read & Write, your bucket only)
3. Save: Account ID, Access Key ID, Secret Access Key, Bucket Name

## Step 3 — Hetzner VPS
1. hetzner.com → Cloud → New Server
2. Ubuntu 24.04 · CX22 (2 vCPU, 4 GB RAM) · Nuremberg · add your SSH key
3. Copy the server IP

## Step 4 — DNS
In Cloudflare DNS:
- A record: @ → server IP → Proxied ON
- A record: www → server IP → Proxied ON

## Step 5 — Server setup (run via SSH)
```bash
ssh root@YOUR_SERVER_IP
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs
npm install -g pm2
apt install -y nginx
mkdir -p /var/www/satsang /etc/ssl/satsang
nano /etc/ssl/satsang/origin.pem        # paste Cloudflare origin cert
nano /etc/ssl/satsang/origin-key.pem    # paste private key
chmod 600 /etc/ssl/satsang/origin-key.pem
```

## Step 6 — Build and deploy (run on your Mac)
```bash
cd ~/Desktop/satsang-platform
npm install && npm run build
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env*' \
  ./ root@YOUR_SERVER_IP:/var/www/satsang/
ssh root@YOUR_SERVER_IP "cd /var/www/satsang && npm install --production"
```

## Step 7 — Configure environment on server
```bash
ssh root@YOUR_SERVER_IP
nano /var/www/satsang/.env.local
# Fill in all values - see .env.example
# KEY ONES:
# DATABASE_URL="file:/var/www/satsang/data/prod.db"
# JWT_SECRET=$(openssl rand -base64 32)
# VAULT_SLUG="your-unguessable-slug"
# NEXT_PUBLIC_VAULT_SLUG="your-unguessable-slug"
# NEXT_PUBLIC_APP_URL="https://yourdomain.com"

mkdir -p /var/www/satsang/data
cd /var/www/satsang
npx prisma db push
ADMIN_EMAIL=you@email.com ADMIN_PASSWORD=strongpass ADMIN_NAME="Your Name" npx tsx scripts/seed.ts
```

## Step 8 — Nginx + PM2
```bash
cp /var/www/satsang/nginx.conf /etc/nginx/sites-available/satsang
# Edit: replace yourdomain.com with your actual domain
nano /etc/nginx/sites-available/satsang
ln -s /etc/nginx/sites-available/satsang /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
cd /var/www/satsang
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

## Step 9 — Cloudflare hardening
- Security > WAF > Enable managed ruleset
- Security > Bots > Enable Bot Fight Mode
- Security > Settings > Security Level: High
- SSL/TLS > Edge Certs > Always Use HTTPS: ON

## Verify
- https://yourdomain.com → public portfolio
- https://yourdomain.com/YOUR_SLUG/enter → vault login

## Deploy updates
```bash
cd ~/Desktop/satsang-platform
npm run build
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env*' \
  ./ root@YOUR_SERVER_IP:/var/www/satsang/
ssh root@YOUR_SERVER_IP "cd /var/www/satsang && npm install --production && pm2 restart satsang"
```

## Backup DB (run weekly)
```bash
ssh root@YOUR_SERVER_IP "cp /var/www/satsang/data/prod.db ~/backup-$(date +%Y%m%d).db"
scp root@YOUR_SERVER_IP:~/backup-*.db ~/Desktop/backups/
```

## Budget
| Service | Cost |
|---|---|
| Hetzner CX22 | ~€4/month |
| Cloudflare R2 400GB | ~$6/month |
| Cloudflare proxy+WAF | Free |
| Domain | ~$12/year |
| **Total** | **~$11/month** |

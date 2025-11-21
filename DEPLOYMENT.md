# 🚀 Deployment Guide

This guide covers deploying the Restaurant POS System to various platforms and environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Building for Production](#building-for-production)
- [Deployment Platforms](#deployment-platforms)
- [Supabase Setup](#supabase-setup)
- [Domain Configuration](#domain-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account and project
- Git repository
- Domain name (optional but recommended)
- SSL certificate (optional but recommended)

## Environment Setup

### 1. Clone and Prepare the Repository

```bash
git clone https://github.com/yourusername/restaurant-pos.git
cd restaurant-pos
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your production values:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-production-anon-key

# App Configuration
REACT_APP_APP_NAME=Your Restaurant Name
REACT_APP_VERSION=1.0.0

# Production Settings
REACT_APP_ENV=production

# Feature Flags
REACT_APP_ENABLE_OFFLINE=true
REACT_APP_ENABLE_BARCODE_SCANNING=true
REACT_APP_ENABLE_RECEIPT_PRINTING=true
REACT_APP_ENABLE_KITCHEN_DISPLAY=true

# Optional: Payment Processing
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

### 4. Update Configuration

Edit the following files with your restaurant information:

- `src/pages/LoginPage.tsx` - Update restaurant name and branding
- `tailwind.config.js` - Customize colors if needed
- Database settings in Supabase (currency, tax rates, etc.)

## Building for Production

```bash
npm run build
# or
yarn build
```

This creates a `build/` directory with optimized, production-ready files.

## Deployment Platforms

### 1. Netlify (Recommended for Most Users)

**Setup:**

1. Create a Netlify account at [netlify.com](https://netlify.com)
2. Connect your Git repository
3. Set the build command: `npm run build`
4. Set the publish directory: `build`
5. Add environment variables in Netlify dashboard

**Environment Variables:**
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_APP_NAME`
- And any other required variables

**Custom Domain:**
1. In Netlify dashboard → Domain management → Add custom domain
2. Update DNS records as instructed by Netlify
3. Netlify provides automatic SSL

### 2. Vercel

**Setup:**

1. Create account at [vercel.com](https://vercel.com)
2. Import your Git repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`
4. Add environment variables in Vercel dashboard

**Custom Domain:**
1. Vercel dashboard → Settings → Domains
2. Add your domain
3. Update DNS records
4. SSL is automatically provisioned

### 3. Traditional Web Hosting

**Setup:**

1. Build the project: `npm run build`
2. Upload the `build/` directory contents to your web server
3. Ensure your server supports:
   - Static file serving
   - URL rewriting (for React Router)
   - HTTPS (recommended)

**Apache Configuration (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. Docker Deployment

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
events {}
http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;

  server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
      try_files $uri $uri/ /index.html;
    }

    location /static/ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
  }
}
```

**Build and Run:**
```bash
docker build -t restaurant-pos .
docker run -p 80:80 restaurant-pos
```

## Supabase Setup

### 1. Production Project Setup

1. Create a new Supabase project (don't use development project)
2. Set up authentication:
   - Enable email/password auth
   - Configure site URL to your production domain
   - Set up email templates
3. Run the database setup scripts in order:
   - `supabase/schema.sql`
   - `supabase/rls_policies.sql`
   - `supabase/functions.sql`
   - `supabase/seed_data.sql` (optional)

### 2. Environment Keys

Get your production keys from Supabase Dashboard → Settings → API:

- **Project URL**: Your Supabase project URL
- **Anon Key**: Your production anon key (public)

### 3. Row Level Security (RLS)

Ensure RLS is enabled on all tables and policies are correctly applied:

```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Test RLS policies
SELECT * FROM branches; -- Should return empty for unauthenticated users
```

### 4. Database Functions

Verify all database functions are working:

```sql
-- Test order generation
SELECT generate_order_number();

-- Test daily report
SELECT daily_sales_report('your-branch-uuid', CURRENT_DATE);

-- Test kitchen orders
SELECT * FROM kitchen_orders('your-branch-uuid');
```

## Domain Configuration

### Custom Domain Setup

1. **DNS Configuration:**
   - Add A record: `@` → your server IP
   - Add CNAME record: `www` → your domain
   - Propagation may take 24-48 hours

2. **Domain in React App:**
   Update `.env` with your domain:
   ```env
   REACT_APP_BASE_URL=https://yourdomain.com
   ```

3. **Update Supabase Settings:**
   - In Supabase Dashboard → Settings → Authentication → Site URL
   - Add your production domain

## SSL/HTTPS Setup

### Automatic SSL (Recommended)

- **Netlify/Vercel**: SSL is automatically provided
- **Cloudflare**: Free SSL through Cloudflare CDN
- **Let's Encrypt**: Free certificates with auto-renewal

### Manual SSL Setup

If using traditional hosting:

1. Generate CSR (Certificate Signing Request)
2. Purchase SSL certificate or use Let's Encrypt
3. Install certificate on your server
4. Configure server for HTTPS

**Nginx SSL Config:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

## Monitoring & Logging

### Application Monitoring

1. **Error Tracking:**
   - Integrate Sentry for error monitoring
   - Set up alerts for critical errors

2. **Performance Monitoring:**
   - Use Google Analytics for user metrics
   - Monitor Core Web Vitals
   - Set up uptime monitoring (Pingdom, UptimeRobot)

3. **Supabase Monitoring:**
   - Monitor database performance
   - Set up alerts for database errors
   - Track usage quotas and limits

### Log Management

1. **Application Logs:**
   - Implement client-side error logging
   - Send critical errors to logging service

2. **Database Logs:**
   - Monitor Supabase logs for database activity
   - Set up alerts for security events

3. **Access Logs:**
   - Monitor user access patterns
   - Track failed login attempts

## Security Best Practices

### 1. Environment Variables

- Never commit `.env` files
- Use different keys for production and development
- Regularly rotate Supabase keys

### 2. Authentication

- Enable two-factor authentication for admin accounts
- Implement session timeout
- Use strong password requirements

### 3. Data Protection

- Ensure RLS policies are comprehensive
- Regular backup of Supabase database
- Monitor for data access anomalies

### 4. Network Security

- Use HTTPS everywhere
- Implement proper CORS policies
- Consider CDN for added security

## Backup and Recovery

### 1. Code Backup

- Use Git for version control
- Tag releases for easy rollback
- Keep branches organized

### 2. Database Backup

- Enable Supabase automated backups
- Regular manual backups before major changes
- Test restore procedures

### 3. Asset Backup

- Back up custom images and assets
- Document configuration changes
- Keep deployment records

## Testing in Production

### 1. Staging Environment

- Set up staging environment with production-like settings
- Test all features before production deployment
- Use real data (anonymized) for testing

### 2. Production Testing

- Test critical functionality immediately after deployment
- Monitor error rates and performance
- Have rollback plan ready

### 3. User Acceptance Testing

- Test with real staff members
- Collect feedback on usability
- Address issues quickly

## Performance Optimization

### 1. Build Optimization

- Use production build with minification
- Enable code splitting for large apps
- Optimize images and assets

### 2. CDN Configuration

- Use CDN for static assets
- Enable compression (Gzip/Brotli)
- Configure caching headers

### 3. Database Optimization

- Monitor query performance
- Add database indexes as needed
- Optimize Supabase RLS policies

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check environment variables
   - Verify all dependencies installed
   - Check for TypeScript errors

2. **Deploy Errors:**
   - Verify build directory exists
   - Check environment variables in deployment platform
   - Review deployment logs

3. **Authentication Issues:**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Test user creation manually

4. **Database Connection:**
   - Verify Supabase project is active
   - Check network connectivity
   - Review RLS policies

### Debug Tools

- Browser Developer Tools
- Supabase Dashboard logs
- Network tab for API calls
- Console for JavaScript errors

### Support Resources

- Supabase Documentation
- React Documentation
- Platform-specific help docs
- GitHub Issues

## Scaling Considerations

### When to Scale

- High traffic (>1000 concurrent users)
- Multiple locations
- Complex reporting needs
- Custom integrations

### Scaling Options

- Upgrade Supabase plan for higher limits
- Use CDN for global distribution
- Implement microservices architecture
- Consider dedicated hosting

---

For additional support or questions, please refer to the [GitHub repository](https://github.com/yourusername/restaurant-pos) or create an issue.
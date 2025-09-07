# HTTPS Setup for Local Development

## Problem
Facebook OAuth requires HTTPS, but Next.js's built-in HTTPS failed with mkcert certificate generation errors.

## Solution

### 1. Install mkcert
```bash
# Already installed via npm
mkcert -version
```

### 2. Install root certificate
```bash
mkcert -install
# Note: May show Java permission errors but still works
```

### 3. Generate localhost certificates
```bash
mkcert localhost 127.0.0.1 ::1
# Creates: localhost+2.pem and localhost+2-key.pem
```

### 4. Update package.json
```json
"dev:https": "next dev --turbopack --experimental-https --experimental-https-key ./localhost+2-key.pem --experimental-https-cert ./localhost+2.pem"
```

### 5. Run HTTPS server
```bash
npm run dev:https
```

## Result
- HTTP: `http://localhost:3000`
- HTTPS: `https://localhost:3001` (or 3006 if 3000/3001 busy)

## Facebook OAuth Setup
Update Facebook app redirect URI to: `https://localhost:3001/auth/callback`

## Key Issues Fixed
- mkcert permission errors (ignored, still works)
- Port conflicts (Next.js auto-finds available ports)
- Certificate path specification in Next.js command



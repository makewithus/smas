# System Security Architecture: SMAS Portal

This document outlines the security controls, measures, and architectural features implemented within the Student Management and Administration System (SMAS). These features are designed to secure all interactions, prevent unauthorized access, and satisfy the requirements of a production-grade enterprise application.

---

## 1. Dual-Layer Session Authentication (Anti-Auto-Login Protection)

### The Loophole Fixed
Previously, the system relied solely on client-side authentication listeners. This meant that if a user closed their browser tab, their client-side session could automatically log them back in upon returning (using the browser's persistent cache) even if their server-side session had expired or was deleted. This created a security desynchronization where a client appeared logged in but backend operations would fail, or unauthorized dashboard views were loaded.

### The Security Control
We have implemented a synchronized authentication flow:
- **State Verification**: On application startup or when user state changes, the client-side system issues a secure verification request to the server to check the validity of the server-side session.
- **Strict Invalidation**: If the server-side verification returns that the session is expired or invalid, the client immediately triggers a complete sign-out, clearing client-side caches, resetting the portal state, and redirecting the user to the login screen.
- **Logout Synchronization**: If client-side authorization state expires or transitions to logged-out, the system automatically requests the server to clear and delete the server session cookie, preventing orphaned active cookies on the client.
- **Portal Boundary Enforcement**: The server verification response returns the specific portal boundary assigned to the administrator. The client is forced to align with this assignment, preventing lateral privilege escalation.

---

## 2. Dynamic Session Cookie Configuration

### Session Cookies (Server-Only Control)
The session token is stored in a secure cookie with the following directives:
- **JavaScript Isolation**: Ensures that client-side scripts, browser extensions, or third-party libraries cannot access the cookie, preventing session hijacking via Cross-Site Scripting (XSS).
- **Transport Encryption**: Ensures the cookie is only transmitted over encrypted connections (HTTPS) in production.
- **Cross-Site Request Forgery Protection**: Protects the application from unauthorized state-changing actions by preventing the browser from sending the cookie along with cross-site requests.
- **Remember Me Alignment**: 
  - If a user checks **"Remember me"** at login, both the client session and the server cookie are persisted (with an expiration limit of 8 hours).
  - If **"Remember me"** is unchecked, the client session is set to clear when the browser tab is closed, and the server cookie is configured as a standard session cookie (automatically destroyed by the browser upon exit). This ensures perfect synchronization between client and server states.
- **Production Host Binding**: In production, the session cookie is strictly bound to the domain name, preventing it from being set or read from subdomains. In development, it falls back to a standard session cookie to allow local testing.

---

## 3. Cryptographic Token Generation and Verification

### Token Specification
The session token is a custom JSON Web Token (JWT) constructed with:
- **Native Web Cryptography**: Utilizes high-performance, native cryptographic signing using the HMAC-SHA256 protocol via standard Web Crypto APIs, fully compatible with Edge and NodeJS runtimes.
- **Timing-Safe Checks**: Implements a dedicated bitwise comparison on signatures during verification, rendering signature validation immune to timing attacks.
- **Session Payload Sanitization**: Only the minimum required claims (including unique user identifier, email, role, portal, status, and name) are signed and verified. Unrecognized fields are automatically stripped.
- **High-Entropy Keys**: Enforces a minimum cryptographic secret length of 512 bits. If the configured key has insufficient length, the server will refuse to start the session module. The session secret key has been upgraded to a high-entropy random hex string.

---

## 4. Server-Only Execution and Secret Guard

### Prevention of Source Code Exposure
- **Server-Only Guards**: A runtime assertion has been added to the cryptographic session module. This blocks the compiler from ever bundling private signing functions, verification logic, or environment secrets into client-side build files.
- **Zero Client-Side Environment Leaks**: All private secrets are excluded from the client-side environment. The framework natively keeps these variables restricted to the server environment, making them completely absent in page sources and client bundles.
- **Cloudinary Deletion Security**: Uploads occur client-side via secure, unsigned presets. However, asset deletion requires an API signature and is routed through a secure, server-side API which validates the admin's session before signing the request.

---

## 5. Database Access Controls (Firebase Rules)

Database interactions are restricted at the Firestore level via declarative Security Rules:
- **User Role Restricting**: Role mappings are queried in real-time from the database. A user's profile document cannot be written to by the user themselves, preventing self-escalation.
- **Partitioned Collection Access**: Boys-portal records are restricted to accounts where the user's role is Boys Admin or Super Admin. Girls-portal records are similarly locked to Girls Admin or Super Admin.
- **Public Read Filters**: Notice and event collections only allow read access if the document is explicitly marked as public or enabled.

---

## 6. Code Optimization and Clean-up

To optimize the codebase and keep it clean:
- **Removed Unused Endpoint Files**: Deleted unused client-side API helper files, old utility scripts, and setup routes, preventing confusion and reducing the application's attack surface.
- **Removed Unused Environment Variables**: Obsolete variables (which were never consumed by active components) were completely removed from the environment to reduce surface area.
- **Zero-Warning Production Builds**: Verified that the entire project compiles with 100% success using the production compiler, ensuring no build warnings or type issues.

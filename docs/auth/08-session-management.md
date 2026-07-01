# SESSION MANAGEMENT

## Token Architecture

CUSTOMER:
  Access Token  : JWT, expires in 15 minutes
  Refresh Token : JWT, expires in 7 days
  Storage       : httpOnly Secure cookies
  
ADMIN:
  Access Token  : JWT, expires in 15 minutes
  Refresh Token : JWT, expires in 24 hours
  Storage       : httpOnly Secure cookies
  Extra         : Session ID stored in DB (allows remote logout)

## Silent Token Refresh
When Access Token expires:
1. API call returns 401
2. Interceptor catches 401
3. Call /api/auth/refresh with refresh token
4. Get new access token
5. Retry original request
6. If refresh also fails → Logout user → Redirect to login

## Zustand Auth Store
/src/store/authStore.ts

State:
  user          : User object | null
  isLoggedIn    : boolean
  isLoading     : boolean
  role          : 'guest' | 'customer' | 'admin'

Actions:
  login(userData)    : Set user, isLoggedIn = true
  logout()           : Clear user, clear cart if needed
  updateProfile()    : Update user details
  setLoading()       : Set loading state

## What to Store in User Object
  id            : string
  name          : string
  mobile        : string
  email         : string | null
  avatar        : string | null
  role          : 'customer' | 'admin'
  language      : 'en' | 'ta'
  isVerified    : boolean
  createdAt     : string

NEVER store: passwords, tokens in Zustand/localStorage

## Persistent Login (Remember Me)
Customer : Always persistent (7 days)
Admin    : Only if "Remember me" checked (1 day)
           Without remember me → session only (tab close = logout)

## Logout Behavior
Customer Logout:
  1. Call /api/auth/logout (invalidate refresh token)
  2. Clear httpOnly cookies
  3. Clear Zustand auth store
  4. Clear cart store (optional — ask user)
  5. Redirect to home page
  6. Toast: "Logged out successfully"

Admin Logout:
  1. Call /api/auth/admin/logout
  2. Invalidate session in DB
  3. Clear cookies
  4. Redirect to /admin/login
  
## Auto Logout
Customer : After 7 days of inactivity
Admin    : After 4 hours of inactivity
           Warning: "Session expiring in 5 minutes" modal
           [Stay Logged In] [Logout]

## Security Headers
Content-Security-Policy : strict
X-Frame-Options         : DENY
X-Content-Type-Options  : nosniff
Referrer-Policy         : strict-origin-when-cross-origin

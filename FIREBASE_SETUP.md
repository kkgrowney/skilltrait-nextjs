# Firebase Authentication Setup

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

## 2. Enable Authentication

1. In the Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**
   - **Google**
   - **Apple** (if needed)

## 3. Get Firebase Configuration

1. In the Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web"
4. Register your app and copy the configuration

## 4. Set Environment Variables

Create a `.env.local` file in your project root with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 5. Configure Google Sign-In (Optional)

1. In Firebase Console, go to Authentication > Sign-in method
2. Click on "Google" provider
3. Enable it and add your authorized domains
4. For development, add `localhost` to authorized domains

## 6. Configure Apple Sign-In (Optional)

1. In Firebase Console, go to Authentication > Sign-in method
2. Click on "Apple" provider
3. Enable it and configure with your Apple Developer account

## 7. Test the Sign-In Page

1. Start your development server: `npm run dev`
2. Navigate to `/signin`
3. Test the authentication flow

## Features Implemented

- ✅ **Responsive Design**: Desktop and mobile layouts
- ✅ **Email/Password Authentication**: Traditional sign-in
- ✅ **Google Sign-In**: OAuth with Google
- ✅ **Apple Sign-In**: OAuth with Apple
- ✅ **Password Visibility Toggle**: Show/hide password
- ✅ **Remember Me**: Checkbox functionality
- ✅ **Error Handling**: Display authentication errors
- ✅ **Loading States**: Show loading during authentication
- ✅ **Protected Routes**: Redirect unauthenticated users
- ✅ **Authentication Context**: Global user state management

## Usage

### Basic Sign-In
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.email}!</div>;
}
```

### Protected Route
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

## Security Notes

- Environment variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Firebase handles all authentication security
- User sessions are managed by Firebase Auth
- Protected routes automatically redirect unauthenticated users 
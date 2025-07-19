#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Firebase Configuration Setup');
console.log('===============================\n');

console.log('To complete your Firebase setup, you need to:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project or select an existing one');
console.log('3. Go to Project Settings (gear icon)');
console.log('4. Scroll down to "Your apps" section');
console.log('5. Click "Add app" and select "Web"');
console.log('6. Register your app and copy the configuration\n');

console.log('Your current API key is: AIzaSyAfYdPmFAjw72BD1s-qiwuVhT-YCXCl4_U\n');

rl.question('Enter your Firebase Auth Domain (e.g., your-project.firebaseapp.com): ', (authDomain) => {
  rl.question('Enter your Firebase Project ID: ', (projectId) => {
    rl.question('Enter your Firebase Storage Bucket (e.g., your-project.appspot.com): ', (storageBucket) => {
      rl.question('Enter your Firebase Messaging Sender ID: ', (messagingSenderId) => {
        rl.question('Enter your Firebase App ID: ', (appId) => {
          
          const envContent = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAfYdPmFAjw72BD1s-qiwuVhT-YCXCl4_U
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${appId}`;

          fs.writeFileSync('.env.local', envContent);
          
          console.log('\n✅ Environment file created successfully!');
          console.log('\nNext steps:');
          console.log('1. Enable Authentication in Firebase Console');
          console.log('2. Go to Authentication > Sign-in method');
          console.log('3. Enable Email/Password, Google, and Apple providers');
          console.log('4. For Google Sign-in, add localhost to authorized domains');
          console.log('5. Restart your development server: npm run dev');
          console.log('6. Test the sign-in page at http://localhost:3002/signin');
          
          rl.close();
        });
      });
    });
  });
}); 
// Only NEXT_PUBLIC_* ever goes here. Each key must be read as a literal
// `process.env.NEXT_PUBLIC_X` so Next can inline it into the client bundle.
export const publicEnv = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  // /demo and /api/demo: always on outside production, or in production with NEXT_PUBLIC_DEMO_MODE=true.
  DEMO_MODE: process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_MODE === "true",
  FIREBASE: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
};

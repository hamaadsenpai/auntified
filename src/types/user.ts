/** The parts of `users/{uid}` the app reads. Safe to pass to Client Components. */
export type UserProfile = {
  currency: string | null;
  onboarded: boolean;
};

/** Body of PATCH /api/me/preferences. `completeOnboarding` also stamps `onboardedAt`. */
export type UpdatePreferences = {
  currency: string;
  completeOnboarding?: true;
};

/** Response of PATCH /api/me/preferences. */
export type Preferences = {
  currency: string;
};

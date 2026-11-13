// Only a UI preference lives in localStorage — never task data.
const ONBOARDED_KEY = 'taskflow:onboarded';

export function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return true; // storage blocked (private mode etc.): don't trap the user on the welcome screen
  }
}

export function markOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDED_KEY, '1');
  } catch {
    // ignore
  }
}

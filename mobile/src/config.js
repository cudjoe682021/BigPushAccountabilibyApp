import Constants from 'expo-constants';

// Set expo.extra.apiBaseUrl in app.json once the Phase 1 API is deployed.
// Falls back to a local dev server for `expo start` during development.
export const API_BASE_URL =
Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000';

export const REPORT_CATEGORIES = [
{ value: 'WORK_STOPPED', label: 'Work has stopped' },
{ value: 'NO_WORKERS', label: 'No workers for weeks' },
{ value: 'ROAD_DAMAGED', label: 'Road is damaged' },
{ value: 'CONTRACTOR_WORKING', label: 'Contractor is working' },
{ value: 'OTHER', label: 'Something else' },
];

export const STATUS_LABELS = {
  ON_SCHEDULE: { label: 'On schedule', color: '#2e7d32' },
    DELAYED: { label: 'Delayed', color: '#f9a825' },
WORK_STOPPED: { label: 'Work stopped', color: '#c62828' },
NOT_RECENTLY_VERIFIED: { label: 'Not recently verified', color: '#757575' },
};

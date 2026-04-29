# To switch to from Firestore back to only localStorage (or vice versa):

1. replace FirestoreProvider with LocalStorageProvider in main.tsx
2. replace all calls to useFirestoreContext with useLocalStorageContext

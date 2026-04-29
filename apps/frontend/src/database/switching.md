# To switch to from Firestore back to only localStorage:

1. replace FirestoreProvider with LocalStorageProvider in main.tsx
2. replace all calls to useFirestoreContext with useLocalStorageContext
3. remove all the catch(errors) on all the setStates around the app

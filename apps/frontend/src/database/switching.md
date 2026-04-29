# To switch to from Firestore back to only localStorage:

1. replace all calls to useFirestoreContext with useLocalStorageContext
2. remove all the catch(errors) on all the setStates around the app

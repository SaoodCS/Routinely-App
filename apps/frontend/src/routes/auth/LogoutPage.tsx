import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import SpinnerLoader from '../../components/SpinnerLoader';
import { auth } from '../../firebase/config';

export default function LogoutPage(): React.JSX.Element {
   useEffect(() => {
      signOut(auth).catch((e) => window.alert(e instanceof FirebaseError ? e.message : 'Logout failed.'));
   }, []);
   return <SpinnerLoader fullPage transluscent />;
}

import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import SpinnerLoader from '../../components/SpinnerLoader';
import { auth } from '../../firebase/config';

export function Logout(): React.JSX.Element {
   useEffect(() => {
      signOut(auth).catch((err) => window.alert(err instanceof Error ? err.message : 'Could not log out.'));
   }, []);
   return <SpinnerLoader fullPage transluscent />;
}

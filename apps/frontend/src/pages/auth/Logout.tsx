import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import SpinnerLoader from '../../components/SpinnerLoader';
import { auth } from '../../firebase/config';

export function Logout(): React.JSX.Element {
   useEffect(() => {
      void signOut(auth);
   }, []);
   return <SpinnerLoader fullPage transluscent />;
}

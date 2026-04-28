import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { getErrorMsg } from '@repo/utils/database.helper';
import SpinnerLoader from '../../components/SpinnerLoader';
import { auth } from '../../firebase/config';

export function Logout(): React.JSX.Element {
   useEffect(() => {
      signOut(auth).catch((err) => window.alert(getErrorMsg(err, 'Logout failed.')));
   }, []);
   return <SpinnerLoader fullPage transluscent />;
}

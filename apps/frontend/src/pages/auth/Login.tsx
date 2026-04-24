import { useLocation } from 'react-router';

export function Login(): React.JSX.Element {
   const { state } = useLocation() as { state?: { from?: string } };
   // TODO: implement login functionality here. If the user logs in successfully, navigate them to state.from (if state.from doesn't exist or is /logout, then nav them to '/')
   return <>Login</>;
}

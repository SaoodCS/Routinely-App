import { Outlet } from 'react-router';

export default function Settings(): React.JSX.Element {
   return (
      <div>
         <div>Settings</div>
         <Outlet />
      </div>
   );
}

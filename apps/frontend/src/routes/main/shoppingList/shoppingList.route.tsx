import { ShoppingCartOutlined } from '@mui/icons-material';
import SearchParamField from '../../../components/SearchParamField';
import { ROUTE_PATHS, SafeRoute } from '../../utils.route';
import ShoppingListPage from './ShoppingListPage';
import ShoppingListActionsMenuButton from './ShoppingListActionsMenuButton';

export const shoppingListRoute = (
   <SafeRoute path={ROUTE_PATHS.main_shoppingList} handle={{ nav: { inBottomNav: true } }}>
      <SafeRoute
         index
         element={<ShoppingListPage />}
         handle={{
            header: {
               title: 'Shopping List',
               Icon: () => <ShoppingCartOutlined sx={{ color: 'primary.light' }} />,
               RightElement: () => (
                  <>
                     <SearchParamField className={'SearchParamField-appHeader'} />
                     <ShoppingListActionsMenuButton />
                  </>
               ),
            },
         }}
      />
   </SafeRoute>
);

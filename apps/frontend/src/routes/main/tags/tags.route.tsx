import { LocalOfferOutlined } from '@mui/icons-material';
import SearchParamField from '../../../components/SearchParamField';
import { ROUTE_PATHS, SafeRoute } from '../../index.route';
import TagsActionsMenuButton from './TagsActionsMenuButton';
import TagsPage from './TagsPage';
import { tagIdRoute } from './tagId/tagid.route';

export const tagsRoute = (
   <SafeRoute path={ROUTE_PATHS.main_tags} handle={{ nav: { inBottomNav: true } }}>
      <SafeRoute
         index
         element={<TagsPage />}
         handle={{
            header: {
               title: 'Tags',
               Icon: () => <LocalOfferOutlined sx={{ color: 'primary.light' }} />,
               RightElement: () => (
                  <>
                     <SearchParamField className={'SearchParamField-appHeader'} />
                     <TagsActionsMenuButton />
                  </>
               ),
            },
         }}
      />
      {tagIdRoute}
   </SafeRoute>
);

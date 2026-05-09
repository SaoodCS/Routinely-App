import { LocalOfferOutlined } from '@mui/icons-material';
import SearchParamField from '../../../components/SearchParamField';
import { ROUTE_PATHS } from '../../routes.constants';
import { SafeRoute } from '../../routes.components';
import TagsActionsMenuButton from './TagsActionsMenuButton';
import TagsPage from './TagsPage';
import TagIdPage from './tagId/TagIdPage';
import TagTasksHeaderTitle from './tagId/TagIdHeaderTitle';

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
      <SafeRoute
         path={ROUTE_PATHS.main_tags_tagId}
         element={<TagIdPage />}
         handle={{
            header: {
               showBack: true,
               title: () => <TagTasksHeaderTitle />,
               RightElement: () => <SearchParamField className={'SearchParamField-appHeader'} />,
            },
         }}
      />
   </SafeRoute>
);

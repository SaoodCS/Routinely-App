import SearchParamField from '../../../../components/SearchParamField';
import { SafeRoute, ROUTE_PATHS } from '../../../index.route';
import TagTasksHeaderTitle from './TagIdHeaderTitle';
import TagIdPage from './TagIdPage';

export const tagIdRoute = (
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
);

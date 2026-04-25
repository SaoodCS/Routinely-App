import { SearchOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';

export default function SearchQuery(): React.JSX.Element {
   function handleSearchQuery(): void {}

   return (
      <IconButton color="primary" onClick={handleSearchQuery}>
         <SearchOutlined />
      </IconButton>
   );
}

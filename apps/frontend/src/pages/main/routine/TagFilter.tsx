import { FilterListOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useState } from 'react';

export default function TagFilter(): React.JSX.Element {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <>
         <IconButton color="primary" disabled={!isOpen}>
            <FilterListOutlined />
         </IconButton>
      </>
   );
}

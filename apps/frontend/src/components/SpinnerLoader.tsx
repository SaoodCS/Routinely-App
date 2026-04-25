// component has mui dependencies
import { Box, CircularProgress, type CircularProgressProps } from '@mui/material';
import type React from 'react';

export default function SpinnerLoader(props: CircularProgressProps & { fullPage?: boolean; transluscent?: boolean }): React.JSX.Element {
   const { fullPage, transluscent, ...rest } = props;
   if (fullPage) {
      return (
         <Box
            sx={{
               position: 'fixed',
               height: '100%',
               width: '100%',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               backgroundColor: transluscent ? '#ffffff2f' : 'transparent',
               zIndex: 5,
            }}
         >
            <CircularProgress />
         </Box>
      );
   }

   return <CircularProgress {...rest} />;
}

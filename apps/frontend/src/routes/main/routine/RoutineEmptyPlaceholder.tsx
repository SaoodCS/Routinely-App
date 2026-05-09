import { TaskAltOutlined } from '@mui/icons-material';
import { Box, Stack, Typography, useTheme } from '@mui/material';

export default function RoutineEmptyPlaceholder(): React.JSX.Element {
   const { palette } = useTheme();
   return (
      <Stack
         minHeight="100%"
         justifyContent="center"
         alignItems="center"
         padding={2}
         sx={{
            background: palette.background.default,
            backgroundImage: `linear-gradient(to right, #42a4f51d 1px, transparent 1px),linear-gradient(to bottom, #42a4f51d 1px, transparent 1px),radial-gradient(circle at 50% 50%, #42a4f519 0%, transparent 70%)`,
            backgroundSize: '85px 85px, 85px 85px, 100% 100%',
         }}
      >
         <Stack
            direction={'row'}
            alignItems={'center'}
            gap={3}
            boxShadow={'0 24px 80px #00000080'}
            bgcolor={'#ffffff05'}
            sx={{ p: { xs: 3, sm: 4 }, backdropFilter: 'blur(3px)', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
         >
            <TaskAltOutlined fontSize="large" sx={{ color: 'grey.500' }} />
            <Box>
               <Typography variant={'h6'} color="textSecondary">
                  {'No Tasks.'}
               </Typography>
               <Typography variant={'caption'} color={'textSecondary'}>
                  {'Create a task below to get started.'}
               </Typography>
            </Box>
         </Stack>
      </Stack>
   );
}

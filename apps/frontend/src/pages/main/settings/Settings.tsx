import { CheckCircleOutline, DeleteOutline, RadioButtonUnchecked } from '@mui/icons-material';
import { Box, Divider, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import SwipeActionItem from '../../../components/SwipeActionWrapper';

type ExampleSetting = {
   id: string;
   label: string;
   description: string;
   enabled: boolean;
};

const exampleSettings: ExampleSetting[] = [
   { id: 'morning-reminder', label: 'Morning reminder', description: 'Swipe right to toggle this example.', enabled: true },
   { id: 'evening-summary', label: 'Evening summary', description: 'Swipe left to delete this example.', enabled: false },
   { id: 'weekly-review', label: 'Weekly review', description: 'Actions can call any function you pass in.', enabled: true },
];

export default function Settings(): React.JSX.Element {
   const [settings, setSettings] = useState(exampleSettings);

   const toggleSetting = (settingId: string): void => {
      setSettings((currentSettings) =>
         currentSettings.map((setting) => (setting.id === settingId ? { ...setting, enabled: !setting.enabled } : setting)),
      );
   };

   const deleteSetting = (settingId: string): void => {
      setSettings((currentSettings) => currentSettings.filter((setting) => setting.id !== settingId));
   };

   return (
      <Box sx={{ p: 2 }}>
         <Typography sx={{ mb: 2 }} variant="body2">
            Swipe right to toggle, or swipe left to delete.
         </Typography>
         <Paper variant="outlined">
            <List disablePadding>
               {settings.map((setting, index) => (
                  <Box key={setting.id}>
                     <SwipeActionItem
                        leftAction={{
                           label: setting.enabled ? 'Disable' : 'Enable',
                           icon: setting.enabled ? <RadioButtonUnchecked /> : <CheckCircleOutline />,
                           onAction: () => toggleSetting(setting.id),
                        }}
                        rightAction={{
                           label: 'Delete',
                           icon: <DeleteOutline />,
                           onAction: () => deleteSetting(setting.id),
                        }}
                     >
                        <ListItem
                           secondaryAction={setting.enabled ? <CheckCircleOutline color="success" /> : <RadioButtonUnchecked color="disabled" />}
                           sx={{ bgcolor: 'background.paper' }}
                        >
                           <ListItemText primary={setting.label} secondary={setting.description} />
                        </ListItem>
                     </SwipeActionItem>
                     {index < settings.length - 1 && <Divider component="li" />}
                  </Box>
               ))}
            </List>
         </Paper>
      </Box>
   );
}

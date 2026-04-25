import type { T_Tag } from '@repo/types/app';
import { Box, Divider, ListItem, ListItemIcon, Switch, Typography } from '@mui/material';
import { DragIndicatorOutlined } from '@mui/icons-material';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useScrollSaver from '../../../hooks/useScrollSaver';
import DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
export default function Tags(): React.JSX.Element {
   const { ref } = useScrollSaver('tags-scroll');
   const [tags, setTags] = useLocalStorage<T_Tag[]>(`tags`, []);

   function handleDelete(tagIndex: number): void {
      const newTags = [...tags];
      newTags.splice(tagIndex, 1);
      setTags(newTags);
   }

   function handleToggleTag(tagIndex: number): void {
      const newTags = [...tags];
      newTags[tagIndex].isEnabled = !newTags[tagIndex].isEnabled;
      setTags(newTags);
   }

   return (
      <DragAndDropList
         ref={ref}
         items={tags}
         onDrop={(newOrderedItems) => setTags(newOrderedItems)}
         renderItem={(tag, dragElProps, i) => (
            <Box>
               {i > 0 && <Divider />}
               <ListItem>
                  <ListItemIcon {...dragElProps}>
                     <DragIndicatorOutlined />
                  </ListItemIcon>
                  <SwipeActionWrapper
                     rightAction={{ label: 'Delete', bgColor: 'red', onAction: () => handleDelete(i) }}
                     leftAction={{ label: 'Toggle', bgColor: 'green', onAction: () => handleToggleTag(i) }}
                     style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                     <Typography>{tag.label}</Typography>
                     <Switch checked={tag.isEnabled} onChange={() => handleToggleTag(i)} />
                  </SwipeActionWrapper>
               </ListItem>
            </Box>
         )}
         style={{ overflow: 'auto', maxHeight: '100%', height: '100%' }}
      />
   );
}

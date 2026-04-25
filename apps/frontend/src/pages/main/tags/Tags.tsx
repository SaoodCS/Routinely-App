import { DragIndicatorOutlined } from '@mui/icons-material';
import { Box, Divider, ListItem, ListItemIcon, Switch, Typography } from '@mui/material';
import type { T_Tag } from '@repo/types/app';
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useScrollSaver from '../../../hooks/useScrollSaver';

export default function Tags(): React.JSX.Element {
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search');
   const { ref } = useScrollSaver('tags-scroll');
   const [tags, setTags] = useLocalStorage<T_Tag[]>(`tags`, []);

   function handleDelete(tagIndex: number): void {
      const newTags = [...tags];
      newTags.splice(tagIndex, 1);
      setTags(newTags);
   }

   function handleToggle(tagIndex: number): void {
      const newTags = [...tags];
      newTags[tagIndex].isEnabled = !newTags[tagIndex].isEnabled;
      setTags(newTags);
   }

   function handleColorChange(event: ChangeEvent<HTMLInputElement>, tagIndex: number): void {
      const newTags = [...tags];
      newTags[tagIndex] = { ...newTags[tagIndex], color: event.currentTarget.value };
      setTags(newTags);
   }

   function handleSaveLabelOnBlur(event: FocusEvent<HTMLSpanElement>, tagIndex: number): void {
      const newLabel = event.currentTarget.textContent ?? '';
      if (newLabel === tags[tagIndex].label) return;
      const newTags = [...tags];
      newTags[tagIndex] = { ...newTags[tagIndex], label: newLabel };
      setTags(newTags);
   }

   function handleBlurOnEnterClick(event: KeyboardEvent<HTMLSpanElement>): void {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      event.currentTarget.blur();
   }

   function isTagHidden(tagLabel: string): boolean {
      return !(!searchQuery || tagLabel.toLowerCase().includes(searchQuery.toLowerCase()));
   }

   return (
      <DragAndDropList
         ref={ref}
         style={{ overflow: 'auto', height: '100%' }}
         items={tags}
         onDrop={(newOrderedItems) => setTags(newOrderedItems)}
         renderItem={(tag, dragElProps, i) =>
            !isTagHidden(tag.label) && (
               <Box>
                  {i > 0 && <Divider />}
                  <ListItem>
                     <ListItemIcon sx={{ minWidth: 20 }} {...dragElProps}>
                        <DragIndicatorOutlined />
                     </ListItemIcon>
                     <SwipeActionWrapper
                        rightAction={{ label: 'Delete', bgColor: 'red', onAction: () => handleDelete(i) }}
                        leftAction={{ label: 'Toggle', bgColor: 'green', onAction: () => handleToggle(i) }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                     >
                        <Typography
                           component="span"
                           contentEditable
                           suppressContentEditableWarning
                           onBlur={(event) => handleSaveLabelOnBlur(event, i)}
                           onKeyDown={handleBlurOnEnterClick}
                           sx={{ outline: 'none', width: '60%' }}
                        >
                           {tag.label}
                        </Typography>
                        <Box
                           component="input"
                           type="color"
                           value={tag.color}
                           onChange={(event) => handleColorChange(event, i)}
                           sx={{ width: 32, height: 32, border: 0, p: 0, bgcolor: 'transparent', cursor: 'pointer' }}
                        />
                        <Switch checked={tag.isEnabled} onChange={() => handleToggle(i)} />
                     </SwipeActionWrapper>
                  </ListItem>
               </Box>
            )
         }
      />
   );
}

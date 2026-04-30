import { Add, DragIndicatorOutlined } from '@mui/icons-material';
import { Box, Fab, Grow, IconButton, ListItem, Switch, Typography } from '@mui/material';
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import { createNewTag } from '@repo/utils/app.helpers';
import DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import useScrollSaver from '../../../hooks/useScrollSaver';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

export default function Tags(): React.JSX.Element {
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search');
   const { ref } = useScrollSaver('tags-scroll');
   const { tags, setTags, setMorningTasks, setEveningTasks, morningTasks, eveningTasks } = useFirestoreContext();

   function handleDelete(tagIndex: number): void {
      const updatedTags = [...tags];
      updatedTags.splice(tagIndex, 1);
      setTags(updatedTags);
      setMorningTasks(morningTasks.map((task) => ({ ...task, showWhenTags: task.showWhenTags.filter((t) => t !== tags[tagIndex].label) })));
      setEveningTasks(eveningTasks.map((task) => ({ ...task, showWhenTags: task.showWhenTags.filter((t) => t !== tags[tagIndex].label) })));
   }

   function handleToggle(tagIndex: number): void {
      const updatedTags = [...tags];
      updatedTags[tagIndex].isEnabled = !updatedTags[tagIndex].isEnabled;
      setTags(updatedTags);
   }

   function handleColorChange(event: ChangeEvent<HTMLInputElement>, tagIndex: number): void {
      const updatedTags = [...tags];
      updatedTags[tagIndex] = { ...updatedTags[tagIndex], color: event.currentTarget.value };
      setTags(updatedTags);
   }

   function handleSaveLabelOnBlur(event: FocusEvent<HTMLSpanElement>, tagIndex: number): void {
      const updatedLabel = event.currentTarget.textContent ?? '';
      if (updatedLabel === tags[tagIndex].label) return;
      const updatedTags = [...tags];
      updatedTags[tagIndex] = { ...updatedTags[tagIndex], label: updatedLabel };
      setTags(updatedTags);
   }

   function handleBlurOnEnterClick(event: KeyboardEvent<HTMLSpanElement>): void {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      event.currentTarget.blur();
   }

   function isTagHidden(tagLabel: string): boolean {
      return !(!searchQuery || tagLabel.toLowerCase().includes(searchQuery.toLowerCase()));
   }

   function handleCreateTag(): void {
      const newTag = createNewTag();
      setTags([...tags, newTag]);
   }

   return (
      <>
         <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
            <Add onClick={handleCreateTag} />
         </Fab>
         <DragAndDropList
            ref={ref}
            style={{ overflow: 'auto', height: '100%' }}
            items={tags}
            onDrop={(newOrderedItems) => setTags(newOrderedItems)}
            renderItem={(tag, dragElProps, i) =>
               !isTagHidden(tag.label) && (
                  <Grow in timeout={500}>
                     <ListItem sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                        <SwipeActionWrapper
                           rightAction={{ label: 'Delete', bgColor: 'red', onAction: () => handleDelete(i) }}
                           leftAction={{ label: 'Toggle', bgColor: 'green', onAction: () => handleToggle(i) }}
                           style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                           <IconButton {...dragElProps} size="small">
                              <DragIndicatorOutlined />
                           </IconButton>
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
                  </Grow>
               )
            }
         />
      </>
   );
}

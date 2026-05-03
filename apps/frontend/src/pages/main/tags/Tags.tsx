import { Add, DragIndicatorOutlined } from '@mui/icons-material';
import { Fab, Grow, IconButton, ListItem, Switch, Typography } from '@mui/material';
import { createNewTag } from '@repo/utils/app.utils';
import type { FocusEvent, KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import useScrollSaver from '../../../hooks/useScrollSaver';

export default function Tags(): React.JSX.Element {
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search');
   const { ref } = useScrollSaver('tags-scroll');
   const { tags, setTags, setMorningTasks, setEveningTasks, morningTasks, eveningTasks } = useFirestoreContext();

   function handleDelete(tagIndex: number): void {
      setTags(tags.filter((_, i) => i !== tagIndex));
      setMorningTasks(morningTasks.map((task) => ({ ...task, showWhenTags: task.showWhenTags.filter((t) => t !== tags[tagIndex].id) })));
      setEveningTasks(eveningTasks.map((task) => ({ ...task, showWhenTags: task.showWhenTags.filter((t) => t !== tags[tagIndex].id) })));
   }

   function handleToggle(tagIndex: number): void {
      const updatedTags = tags.map((tag, i) => (i === tagIndex ? { ...tag, isEnabled: !tag.isEnabled } : tag));
      setTags(updatedTags);
   }

   function handleSaveLabelOnBlur(event: FocusEvent<HTMLSpanElement>, tagIndex: number): void {
      const updatedLabel = event.currentTarget.textContent ?? '';
      if (updatedLabel === tags[tagIndex].label) return;
      const updatedTags = tags.map((tag, i) => (i === tagIndex ? { ...tag, label: updatedLabel } : tag));
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

import { Add, ChevronRight, DragIndicatorOutlined } from '@mui/icons-material';
import { alpha, Box, Fab, Grow, IconButton, ListItem, Stack, Switch, Typography, useTheme } from '@mui/material';
import type { AppTypes } from '@repo/types/index';
import { createNewTag } from '@repo/utils/app.utils';
import type { FocusEvent, KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import useScrollSaver from '../../../hooks/useScrollSaver';
import { ROUTE_PATHS } from '../../../routes/router';
import { InputUtils } from '../../../utils';
import ContentEditableInput from '../../../components/ContentEditableInput';
import NoTagsPlaceholder from './NoTagsPlaceholder';

export default function Tags(): React.JSX.Element {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const normalizedSearchQuery = searchParams.get('search')?.toLowerCase() ?? '';
   const { ref } = useScrollSaver('tags-scroll');
   const { tags, setTagsDb, setMorningTasksDb, setEveningTasksDb, morningTasks, eveningTasks } = useFirestoreContext();
   const { palette } = useTheme();

   function handleDelete(tagIndex: number): void {
      setTagsDb(tags.filter((_, i) => i !== tagIndex));
      setMorningTasksDb(morningTasks.map((task) => ({ ...task, showWhenTags: task.showWhenTags.filter((t) => t !== tags[tagIndex].id) })));
      setEveningTasksDb(eveningTasks.map((task) => ({ ...task, showWhenTags: task.showWhenTags.filter((t) => t !== tags[tagIndex].id) })));
   }

   function handleToggle(tagIndex: number): void {
      const updatedTags = tags.map((tag, i) => (i === tagIndex ? { ...tag, isEnabled: !tag.isEnabled } : tag));
      setTagsDb(updatedTags);
   }

   function handleSaveLabelOnBlur(event: FocusEvent<HTMLInputElement>, tagIndex: number): void {
      const updatedLabel = event.currentTarget.value;
      if (updatedLabel === tags[tagIndex].label) return;
      const updatedTags = tags.map((tag, i) => (i === tagIndex ? { ...tag, label: updatedLabel } : tag));
      setTagsDb(updatedTags);
   }

   function handleKeyPress(event: KeyboardEvent<HTMLInputElement>): void {
      if (event.key === 'Enter') event.currentTarget.blur();
   }

   function isTagRendered(tagLabel: string): boolean {
      return tagLabel.toLowerCase().includes(normalizedSearchQuery);
   }

   function handleCreateTag(): void {
      const newTag = createNewTag();
      setTagsDb([...tags, newTag]);
   }

   function handleOpenTagRoutine(tagId: AppTypes.Tag['id']): void {
      void navigate(`${ROUTE_PATHS.main_tags}/${encodeURIComponent(tagId)}`);
   }

   function getNumberOfTasks(tag: AppTypes.Tag, taskTagField: AppTypes.TaskTagFields): number {
      let numberOfTasks = 0;
      const tasksToCheck = [...morningTasks, ...eveningTasks];
      for (let i = 0; i < tasksToCheck.length; i += 1) {
         const task = tasksToCheck[i];
         if (task[taskTagField].includes(tag.id)) numberOfTasks += 1;
         if (!task.children) continue;
         for (const child of task.children) tasksToCheck.push(child);
      }
      return numberOfTasks;
   }

   return (
      <>
         {tags.length === 0 && <NoTagsPlaceholder />}
         <DragAndDropList
            ref={ref}
            style={{ overflow: 'auto', height: '100%' }}
            items={tags}
            onDrop={(newOrderedItems) => setTagsDb(newOrderedItems)}
            renderItem={(tag, dragElProps, i) => {
               const numberOfShowWhenTasks = getNumberOfTasks(tag, 'showWhenTags');
               const numberOfHideWhenTasks = getNumberOfTasks(tag, 'hideWhenTags');
               return (
                  isTagRendered(tag.label) && (
                     <Box>
                        <Grow in timeout={500}>
                           <ListItem disablePadding sx={{ px: 1, pt: 1 }}>
                              <SwipeActionWrapper
                                 rightAction={{ label: 'Delete', bgColor: 'red', onAction: () => handleDelete(i) }}
                                 leftAction={{ label: 'Toggle', bgColor: 'green', onAction: () => handleToggle(i) }}
                                 style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: alpha(palette.divider, 0.05),
                                    border: `1px solid ${alpha(palette.divider, 0.075)}`,
                                    borderRadius: '6px',
                                    padding: '0 12px 0 12px',
                                 }}
                              >
                                 <Stack direction="row" gap={2} alignItems={'center'} flex={1}>
                                    <IconButton {...dragElProps} sx={{ borderRadius: '5px' }}>
                                       <DragIndicatorOutlined />
                                    </IconButton>
                                    <Stack flex={1} sx={{ py: 1 }}>
                                       <ContentEditableInput
                                          text={tag.label}
                                          onBlur={(event) => handleSaveLabelOnBlur(event, i)}
                                          onKeyDown={handleKeyPress}
                                          onInput={InputUtils.formatInputOnSpace}
                                          style={{ outline: 'none' }}
                                       >
                                          {tag.label}
                                       </ContentEditableInput>
                                       <Typography variant={'caption'} color="textSecondary">
                                          {`${numberOfShowWhenTasks} shown, ${numberOfHideWhenTasks} hidden`}
                                       </Typography>
                                    </Stack>
                                 </Stack>
                                 <Stack direction={'row'} alignItems={'center'} gap={1}>
                                    <Switch checked={tag.isEnabled} onChange={() => handleToggle(i)} />
                                    <IconButton
                                       onClick={() => handleOpenTagRoutine(tag.id)}
                                       disabled={numberOfShowWhenTasks === 0 && numberOfHideWhenTasks === 0}
                                    >
                                       <ChevronRight sx={{ color: 'grey.400' }} />
                                    </IconButton>
                                 </Stack>
                              </SwipeActionWrapper>
                           </ListItem>
                        </Grow>
                     </Box>
                  )
               );
            }}
         />
         <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
            <Add onClick={handleCreateTag} />
         </Fab>
      </>
   );
}

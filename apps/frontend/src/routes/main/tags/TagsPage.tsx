import { Add, ChevronRight, DragIndicatorOutlined, KeyboardDoubleArrowDown } from '@mui/icons-material';
import { alpha, Box, Fab, Grow, IconButton, ListItem, Stack, Switch, Typography, useTheme } from '@mui/material';
import type { AppTypes } from '@repo/types/index';
import { createNewTag } from '@repo/utils/app.utils';
import { useEffect, useRef, type FocusEvent, type KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import ContentEditableField from '../../../components/ContentEditableField';
import DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import useScrollSaver from '../../../hooks/useScrollSaver';
import { InputUtils } from '../../../utils';
import { ROUTE_PATHS } from '../../index.route';
import TagsEmptyPlaceholder from './TagsEmptyPlaceholder';

export default function TagsPage(): React.JSX.Element {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const normalizedSearchQuery = searchParams.get('search')?.toLowerCase() ?? '';
   const { ref } = useScrollSaver('tags-scroll');
   const { tags, setTagsDb, setMorningTasksDb, setEveningTasksDb, morningTasks, eveningTasks } = useFirestoreContext();
   const focusTagIdRef = useRef<string | null>(null);
   const { palette } = useTheme();

   useEffect(() => {
      if (!focusTagIdRef.current) return;
      document.getElementById(focusTagIdRef.current)?.focus();
      focusTagIdRef.current = null;
   }, [tags]);

   function removeTagIdFromTasks(tasks: AppTypes.Task[], tagId: AppTypes.Tag['id']): AppTypes.Task[] {
      const updatedTasks = [...tasks];
      const tasksToUpdate = updatedTasks.map((_, index) => ({ index, taskList: updatedTasks }));
      for (let i = 0; i < tasksToUpdate.length; i += 1) {
         const { index, taskList } = tasksToUpdate[i];
         const task = taskList[index];
         const updatedTask: AppTypes.Task = {
            ...task,
            showWhenTags: task.showWhenTags.filter((t) => t !== tagId),
            hideWhenTags: task.hideWhenTags.filter((t) => t !== tagId),
         };
         taskList[index] = updatedTask;
         if (!task.children) continue;
         const updatedChildren = [...task.children];
         updatedTask.children = updatedChildren;
         for (let j = 0; j < updatedChildren.length; j += 1) tasksToUpdate.push({ index: j, taskList: updatedChildren });
      }
      return updatedTasks;
   }

   function handleDelete(tagIndex: number): void {
      const tagId = tags[tagIndex]?.id;
      if (!tagId) return;
      setTagsDb(tags.filter((_, i) => i !== tagIndex));
      setMorningTasksDb(removeTagIdFromTasks(morningTasks, tagId));
      setEveningTasksDb(removeTagIdFromTasks(eveningTasks, tagId));
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

   function isTagRendered(tagLabel: string): boolean {
      return tagLabel.toLowerCase().includes(normalizedSearchQuery);
   }

   function addTag(focusOnNewTag?: boolean): void {
      const newTag = createNewTag();
      setTagsDb([...tags, newTag]);
      if (focusOnNewTag) focusTagIdRef.current = newTag.id;
   }

   function addTagBelow(tagIndex: number, focusOnNewTag?: boolean): void {
      const newTag = createNewTag();
      const updatedTags = [...tags];
      updatedTags.splice(tagIndex + 1, 0, newTag);
      setTagsDb(updatedTags);
      if (focusOnNewTag) focusTagIdRef.current = newTag.id;
   }

   function handleKeyPress(event: KeyboardEvent<HTMLInputElement>, tagIndex: number): void {
      if (event.key === 'Enter') event.currentTarget.blur();
      if (event.ctrlKey) {
         if (event.key === 'ArrowDown' || event.key === 'Enter') addTagBelow(tagIndex, true);
      }
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
         {tags.length === 0 && <TagsEmptyPlaceholder />}
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
                                 <Stack
                                    gap={0.75}
                                    direction="row"
                                    alignItems="center"
                                    sx={{ '& button': { borderRadius: 2, color: 'grey.300', p: 0.3 } }}
                                 >
                                    <IconButton {...dragElProps}>
                                       <DragIndicatorOutlined />
                                    </IconButton>
                                    <IconButton onClick={() => addTagBelow(i)}>
                                       <KeyboardDoubleArrowDown />
                                    </IconButton>
                                    <Stack flex={1} sx={{ py: 1, pl: 1 }}>
                                       <ContentEditableField
                                          id={tag.id}
                                          text={tag.label}
                                          onBlur={(event) => handleSaveLabelOnBlur(event, i)}
                                          onKeyDown={(e) => handleKeyPress(e, i)}
                                          onInput={InputUtils.formatInputOnSpace}
                                          style={{ outline: 'none' }}
                                       >
                                          {tag.label}
                                       </ContentEditableField>
                                       <Typography variant={'caption'} color="textSecondary">
                                          {`${numberOfShowWhenTasks} shown, ${numberOfHideWhenTasks} hidden`}
                                       </Typography>
                                    </Stack>
                                 </Stack>
                                 <Stack direction={'row'} alignItems={'center'} gap={0.75} sx={{ '& button': { color: 'grey.300', p: 0.3 } }}>
                                    <Switch checked={tag.isEnabled} onChange={() => handleToggle(i)} size="small" />
                                    <IconButton
                                       onClick={() => handleOpenTagRoutine(tag.id)}
                                       disabled={numberOfShowWhenTasks === 0 && numberOfHideWhenTasks === 0}
                                    >
                                       <ChevronRight />
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
         <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }} onClick={() => addTag()}>
            <Add />
         </Fab>
      </>
   );
}

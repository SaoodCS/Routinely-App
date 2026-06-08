import { useSearchParams } from 'react-router';
import { useEffect, useRef, type FocusEvent, type KeyboardEvent } from 'react';
import { alpha, Box, Fab, Grow, IconButton, ListItem, Stack, useTheme } from '@mui/material';
import { AppUtils } from '@repo/utils/index';
import type { AppTypes } from '@repo/types/index';
import { Add, DragIndicatorOutlined, KeyboardDoubleArrowDown } from '@mui/icons-material';
import useScrollSaver from '../../../hooks/useScrollSaver';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import { ElementUtils } from '../../../utils';
import ContentEditableField from '../../../components/ContentEditableField';
import TextFormatter from '../../../components/TextFormatter';
import ShoppingListEmptyPlaceholder from './ShoppingListEmptyPlaceholder';

export default function ShoppingListPage(): React.JSX.Element {
   const [searchParams] = useSearchParams();
   const normalizedSearchQuery = searchParams.get('search')?.toLowerCase() ?? '';
   const { ref } = useScrollSaver('shoppingList-scroll');
   const { shoppingList, setShoppingListDb } = useFirestoreContext();
   const focusItemIdRef = useRef<string | null>(null);
   const { palette } = useTheme();

   useEffect(() => {
      if (!focusItemIdRef.current) return;
      document.getElementById(focusItemIdRef.current)?.focus();
      focusItemIdRef.current = null;
   }, [shoppingList]);

   function isItemRendered(itemLabel: string): boolean {
      return itemLabel.toLowerCase().includes(normalizedSearchQuery);
   }

   function handleAddItem(focusOnNewItem?: boolean): void {
      const newItem = AppUtils.createNewShoppingItem();
      setShoppingListDb([...shoppingList, newItem]);
      if (focusOnNewItem) focusItemIdRef.current = newItem.id;
   }

   function handleAddItemAbove(itemIndex: number, focusOnNewItem?: boolean): void {
      const newItem = AppUtils.createNewShoppingItem();
      const updatedItems = [...shoppingList];
      updatedItems.splice(itemIndex, 0, newItem);
      setShoppingListDb(updatedItems);
      if (focusOnNewItem) focusItemIdRef.current = newItem.id;
   }

   function handleAddItemBelow(itemIndex: number, focusOnNewItem?: boolean): void {
      const newItem = AppUtils.createNewShoppingItem();
      const updatedItems = [...shoppingList];
      updatedItems.splice(itemIndex + 1, 0, newItem);
      setShoppingListDb(updatedItems);
      if (focusOnNewItem) focusItemIdRef.current = newItem.id;
   }

   function handleDelete(itemIndex: number): void {
      const itemId = shoppingList[itemIndex]?.id;
      if (!itemId) return;
      setShoppingListDb(shoppingList.filter((_, i) => i !== itemIndex));
   }

   function handleToggleChecked(itemIndex: number): void {
      const updatedItems = shoppingList.map((item, i) => (i === itemIndex ? { ...item, isChecked: !item.isChecked } : item));
      setShoppingListDb(updatedItems);
   }

   function handleSaveLabelOnBlur(event: FocusEvent<HTMLTextAreaElement>, itemIndex: number): void {
      const updatedLabel = event.currentTarget.value;
      if (updatedLabel === shoppingList[itemIndex].label) return;
      const updatedShoppingList = shoppingList.map((item, i) => (i === itemIndex ? { ...item, label: updatedLabel } : item));
      setShoppingListDb(updatedShoppingList);
   }

   function handleReorderOnDrop(newOrderedItems: AppTypes.ShoppingItem[]): void {
      setShoppingListDb(newOrderedItems);
   }

   function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>, tagIndex: number): void {
      if (!event.ctrlKey) {
         if (event.key === 'Enter' || event.key === 'Escape') event.currentTarget.blur();
         return;
      }
      if (event.key === 'ArrowUp') return handleAddItemAbove(tagIndex, true);
      if (event.key === 'ArrowDown' || event.key === 'Enter') return handleAddItemBelow(tagIndex, true);
   }

   return (
      <>
         {shoppingList.length === 0 && <ShoppingListEmptyPlaceholder />}
         <DragAndDropList
            ref={ref}
            style={{ overflow: 'auto', height: '100%' }}
            items={shoppingList}
            onDrop={handleReorderOnDrop}
            renderItem={(item, dragElProps, i) =>
               isItemRendered(item.label) && (
                  <Box>
                     <Grow in timeout={500}>
                        <ListItem disablePadding sx={{ px: 1, pt: 1 }}>
                           <SwipeActionWrapper
                              rightAction={{ label: 'Delete', bgColor: 'red', onAction: () => handleDelete(i) }}
                              leftAction={{ label: 'Toggle', bgColor: 'green', onAction: () => handleToggleChecked(i) }}
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
                                 sx={{ '& button': { borderRadius: 2, color: 'grey.300', p: 0.3 }, flex: 1 }}
                              >
                                 <IconButton {...dragElProps} {...ElementUtils.skipTabFocusProps}>
                                    <DragIndicatorOutlined />
                                 </IconButton>
                                 <IconButton onClick={() => handleAddItemBelow(i)} {...ElementUtils.skipTabFocusProps}>
                                    <KeyboardDoubleArrowDown />
                                 </IconButton>
                                 <Stack flex={1} sx={{ py: 1, pl: 1 }}>
                                    <ContentEditableField
                                       id={item.id}
                                       text={item.label}
                                       onBlur={(event) => handleSaveLabelOnBlur(event, i)}
                                       onKeyDown={(e) => handleKeyDown(e, i)}
                                       onInput={ElementUtils.handleFormatInputOnSpace}
                                       style={{ outline: 'none' }}
                                    >
                                       <TextFormatter
                                          fullText={item.label}
                                          rules={[{ text: normalizedSearchQuery, style: { backgroundColor: palette.warning.main } }]}
                                       />
                                    </ContentEditableField>
                                 </Stack>
                              </Stack>
                           </SwipeActionWrapper>
                        </ListItem>
                     </Grow>
                  </Box>
               )
            }
         />
         <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }} onClick={() => handleAddItem()}>
            <Add />
         </Fab>
      </>
   );
}

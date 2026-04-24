import { Box } from '@mui/material';

const itemDummyData: { id: number; name: string; description: string }[] = [
   { id: 11, name: 'Item 1', description: 'Description of item 1' },
   { id: 22, name: 'Item 2', description: 'Description of item 2' },
   { id: 33, name: 'Item 3', description: 'Description of item 3' },
];

const subItemDummyData: { [key: number]: typeof itemDummyData } = {
   11: [
      { id: 111, name: 'Sub Item 1', description: 'Description of sub item 1' },
      { id: 112, name: 'Sub Item 2', description: 'Description of sub item 2' },
      { id: 113, name: 'Sub Item 3', description: 'Description of sub item 3' },
   ],
   22: [{ id: 221, name: 'Sub Item', description: 'Description of sub item' }],
   33: [
      { id: 332, name: 'Sub Item', description: 'Description of sub item' },
      { id: 333, name: 'Sub Item', description: 'Description of sub item' },
   ],
};

export default function Settings(): React.JSX.Element {
   const [items, setItems] = useState(itemDummyData);
   const [subItems, setSubItems] = useState(subItemDummyData);

   function handleParentDrop(newOrderedArr: typeof itemDummyData) {
      // function that also updates the order in the database
      setItems(newOrderedArr);
   }

   function handleChildDrop(newOrderedArr: (typeof subItemDummyData)[number], parentId: number) {
      // function that also updates the order in the database
      setSubItems({ ...subItems, [parentId]: newOrderedArr });
   }

   return (
      <DragDropWrapper onDrop={(newOrderedArr) => handleParentDrop(newOrderedArr)}>
         {itemDummyData.map((item) => (
            <Box key={item.id}>
               <Box>{item.name}</Box>
               <Box>{item.description}</Box>
               <DragDropWrapper onDrop={(newOrderedArr) => handleChildDrop(newOrderedArr, item.id)}>
                  {subItemDummyData[item.id].map((subItem) => (
                     <Box key={subItem.id}>
                        <Box>{subItem.name}</Box>
                        <Box>{subItem.description}</Box>
                     </Box>
                  ))}
               </DragDropWrapper>
            </Box>
         ))}
      </DragDropWrapper>
   );
}

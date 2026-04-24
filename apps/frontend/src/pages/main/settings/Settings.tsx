import { Box } from '@mui/material';

const itemDummyData: { id: number; name: string; description: string }[] = [
   { id: 11, name: 'Item 1', description: 'Description of item 1' },
   { id: 22, name: 'Item 2', description: 'Description of item 2' },
   { id: 33, name: 'Item 3', description: 'Description of item 3' },
   { id: 111, name: 'Item 1', description: 'Description of item 1' },
   { id: 222, name: 'Item 2', description: 'Description of item 2' },
   { id: 333, name: 'Item 3', description: 'Description of item 3' },
   { id: 1111, name: 'Item 1', description: 'Description of item 1' },
   { id: 2222, name: 'Item 2', description: 'Description of item 2' },
   { id: 3333, name: 'Item 3', description: 'Description of item 3' },
   { id: 11111, name: 'Item 1', description: 'Description of item 1' },
   { id: 22222, name: 'Item 2', description: 'Description of item 2' },
   { id: 33333, name: 'Item 3', description: 'Description of item 3' },
];

const subItemDummyData: { [key: number]: typeof itemDummyData } = {
   11: [
      { id: 1211, name: 'Sub Item 1', description: 'Description of sub item 1' },
      { id: 1212, name: 'Sub Item 2', description: 'Description of sub item 2' },
      { id: 1213, name: 'Sub Item 3', description: 'Description of sub item 3' },
   ],
   22: [{ id: 22321, name: 'Sub Item', description: 'Description of sub item' }],
   33: [
      { id: 33232, name: 'Sub Item', description: 'Description of sub item' },
      { id: 331233, name: 'Sub Item', description: 'Description of sub item' },
   ],
};

export default function Settings(): React.JSX.Element {
   return <Box>Setiings</Box>;
}

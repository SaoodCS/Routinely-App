import { describe, expect, test } from 'vitest';
import { getDragTranslateY, reorderArray } from './DragDropWrapper';

describe('reorderArray', () => {
   test('moves an item to a later index', () => {
      expect(reorderArray(['first', 'second', 'third'], 0, 2)).toEqual(['second', 'third', 'first']);
   });

   test('keeps the order when an index is invalid', () => {
      expect(reorderArray(['first', 'second', 'third'], -1, 1)).toEqual(['first', 'second', 'third']);
   });
});

describe('getDragTranslateY', () => {
   test('keeps the original grab point under the cursor', () => {
      expect(getDragTranslateY({ itemTop: 100, pointerOffsetY: 20, pointerY: 160 })).toBe(40);
   });
});

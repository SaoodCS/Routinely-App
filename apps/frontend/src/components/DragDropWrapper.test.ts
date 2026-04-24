import { describe, expect, test } from 'vitest';
import { getDragTranslateY, getOrderedItems, getReorderIndexByPointer, reorderArray } from './DragDropWrapper';

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

describe('getReorderIndexByPointer', () => {
   test('uses cached item centers to find the reorder target', () => {
      expect(getReorderIndexByPointer({ activeIndex: 0, itemCenterYs: [10, 30, 50], pointerY: 42 })).toBe(1);
   });
});

describe('getOrderedItems', () => {
   test('returns items in the provided index order', () => {
      expect(getOrderedItems(['first', 'second', 'third'], [2, 0, 1])).toEqual(['third', 'first', 'second']);
   });
});

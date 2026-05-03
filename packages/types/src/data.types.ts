export type ArrayMaxLength<Item, MaxLength extends number, Accumulator extends Item[] = []> = MaxLength extends MaxLength
   ? number extends MaxLength
      ? Item[]
      : `${MaxLength}` extends `-${string}` | `${string}.${string}`
        ? never
        : Accumulator['length'] extends MaxLength
          ? never
          : [...Accumulator, Item] | ArrayMaxLength<Item, MaxLength, [...Accumulator, Item]>
   : never;

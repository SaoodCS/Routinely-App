import { Skeleton, Stack, type SkeletonOwnProps } from '@mui/material';

interface T_SkeletonLoader {
   variants?: { type: SkeletonOwnProps['variant']; width: string; height: string; occurance: number }[];
}

export default function SkeletonLoader(props: T_SkeletonLoader): React.JSX.Element {
   const { variants } = props;
   const defaultVariants: T_SkeletonLoader['variants'] = [
      { type: 'rectangular', width: '100%', height: '40%', occurance: 1 },
      { type: 'rectangular', width: '100%', height: '5%', occurance: 9 },
   ];

   return (
      <Stack sx={{ all: 'inherit', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1 }}>
         {(variants ?? defaultVariants).flatMap((variant, i) =>
            Array.from({ length: variant.occurance }, (_, repeatI) => (
               <Skeleton key={`${variant.type}-${i}-${repeatI}`} variant={variant.type} width={variant.width} height={variant.height} />
            )),
         )}
      </Stack>
   );
}

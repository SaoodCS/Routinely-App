import useScrollSaver from '../../../hooks/useScrollSaver';
export default function MorningRoutine(): React.JSX.Element {
   const { ref } = useScrollSaver('morningRoutine');
   return (
      <>
         <div>Morns</div>
      </>
   );
}

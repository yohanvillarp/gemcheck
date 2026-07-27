const getRating = (tdr: number) => {
  if (tdr <= 5) return { grade: 'A', color: 'bg-green-400 text-black border-black', text: 'Excelente' };
  if (tdr <= 10) return { grade: 'B', color: 'bg-green-200 text-black border-black', text: 'Bueno' };
  if (tdr <= 20) return { grade: 'C', color: 'bg-yellow-300 text-black border-black', text: 'Aceptable' };
  if (tdr <= 50) return { grade: 'D', color: 'bg-orange-400 text-black border-black', text: 'Pobre' };
  return { grade: 'E', color: 'bg-red-500 text-white border-black', text: 'Crítico' };
};

export const RatingBadge = ({ tdr }: { tdr: number }) => {
  const rating = getRating(tdr);
  return (
    <div className={`inline-flex flex-col items-center justify-center w-20 h-20 ml-6 border-4 ${rating.color} shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,1)] font-black`}>
      <span className="text-4xl leading-none">{rating.grade}</span>
    </div>
  );
};

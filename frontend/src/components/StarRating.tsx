'use client';

type Props = {
  value: number | null;
  onChange?: (rating: number) => void; // omit for read-only stars
};

export default function StarRating({ value, onChange }: Props) {
  return (
    <div className="flex gap-1" aria-label={`Rating: ${value ?? 0} of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`text-xl leading-none ${star <= (value ?? 0) ? 'text-yellow-500' : 'text-gray-300'} ${
            onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

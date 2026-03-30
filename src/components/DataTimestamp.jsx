export default function DataTimestamp({ generatedAt }) {
  if (!generatedAt) return null;
  const date = new Date(generatedAt);
  const formatted = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return (
    <p className="text-xs text-stone-400 text-center pb-4">
      Data current as of {formatted}.
    </p>
  );
}

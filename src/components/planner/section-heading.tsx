export function SectionHeading({
  title,
  description,
  first,
}: { title: string; description?: React.ReactNode; first?: boolean }) {
  return (
    <div className={first ? "mb-6 space-y-1.5" : "my-6 space-y-1.5"}>
      <h4 className="font-semibold text-2xl leading-none tracking-tight">
        {title}
      </h4>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
}

interface DateDividerProps {
  label: string;
}

export const DateDivider = ({ label }: DateDividerProps) => {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-secondary/80 text-muted-foreground text-xs px-3 py-1 rounded-full shadow-sm">
        {label}
      </div>
    </div>
  );
};

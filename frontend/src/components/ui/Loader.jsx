// frontend/src/components/ui/Loader.jsx

const Loader = ({ size = "md", text = "Loading..." }) => {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-9 w-9 border-[2.5px]",
    lg: "h-14 w-14 border-[3px]",
  };

  return (
    <div className="flex flex-col items-center justify-center
                    gap-4 py-16 animate-fade-in">
      <div
        className={`animate-spin rounded-full ${sizes[size]}`}
        style={{
          borderColor:    "var(--border)",
          borderTopColor: "var(--forest)",
        }}
      />
      {text && (
        <p
          className="text-sm font-bold animate-pulse"
          style={{ color: "var(--ink-faint)" }}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
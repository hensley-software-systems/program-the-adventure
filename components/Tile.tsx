export function TileIcon({
  type,
  doorOpen,
  collected,
}: {
  type: string;
  doorOpen?: boolean;
  collected?: boolean;
}) {
  if (collected && (type === "cookie" || type === "star")) {
    return <span className="text-2xl opacity-30">✨</span>;
  }

  switch (type) {
    case "start":
      return <span className="text-xl">🏁</span>;
    case "cookie":
      return <span className="text-3xl">🍪</span>;
    case "star":
      return <span className="text-3xl">⭐</span>;
    case "bush":
      return <span className="text-3xl">🌳</span>;
    case "puddle":
      return <span className="text-3xl">💧</span>;
    case "door":
      return (
        <span className="text-3xl" aria-label={doorOpen ? "Open door" : "Closed door"}>
          {doorOpen ? "🚪" : "🚪"}
        </span>
      );
    case "goal":
      return <span className="text-3xl">🎯</span>;
    default:
      return null;
  }
}

export default function Loading() {
  return (
    <div className="fixed w-screen h-screen top-0 left-0 flex items-center justify-center flex-col gap-4 z-100">
      <div className="dice-scene">
        <div className="dice">
          <div className="face front">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot center"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <div className="face back">
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <div className="face right">
            <span className="dot"></span>
            <span className="dot center"></span>
            <span className="dot"></span>
          </div>
          <div className="face left">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <div className="face top">
            <span className="dot"></span>
          </div>
          <div className="face bottom">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
        <div className="shadow"></div>
      </div>
      <div className="text-center text-coal-500 text-lg">Carregando...</div>
    </div>
  );
}

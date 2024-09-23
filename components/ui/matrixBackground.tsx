import { useState, useEffect } from "react";

export default function MatrixBackground() {
  const [matrixChars, setMatrixChars] = useState<string[][]>([]);

  useEffect(() => {
    const chars = Array(100).fill(0).map(() => 
      Array(25).fill(0).map(() => String.fromCharCode(33 + Math.floor(Math.random() * 94)))
    );
    setMatrixChars(chars);
  }, []);

  return (
    <div className="absolute inset-0 opacity-30 pointer-events-none">
      {matrixChars.map((column, i) => (
        <div key={i} className="absolute text-matrix-green text-opacity-75 animate-matrix-rain" 
             style={{
               left: `${i}%`, 
               animationDuration: `${15 + Math.random() * 10}s`,
               animationDelay: `${-Math.random() * 15}s`
             }}>
          {column.map((char, j) => (
            <div key={j} className="text-sm">{char}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
"use client"; // ← 重要！これがないとHooksが動きません

import { useState, useEffect } from 'react';



// さっき定義した型を使う（再利用！）
interface Pokemon {
  id: number;
  name: string;
  image: string; // 画像URLを追加しました
  cries: string; // 鳴き声URLを追加しました
}

// Propsの型定義
interface QuizProps {
  pokemon: Pokemon; // ポケモンデータ丸ごと受け取る
}

export const SilhouetteQuiz = ({ pokemon }: QuizProps) => {
  // 状態管理：最初は答えが見えていない（false）
  const [isRevealed, setIsRevealed] = useState(false);

  // 鳴き声を再生する関数（機能2の準備）
  const playCry = () => {
    const audio = new Audio(pokemon.cries);
    audio.play();
  };

  const handleReveal = () => {
    setIsRevealed(true); // 画像を表示
    playCry();           // 正解と同時に鳴き声を出す！
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3>このポケモンだ〜れだ？</h3>
      
      {/* ポケモン画像 */}
      <img 
        src={pokemon.image} 
        alt="ポケモン"
        style={{ 
          width: '200px',
          // isRevealedがfalseなら黒くする、trueならそのまま
          filter: isRevealed ? 'none' : 'brightness(0)',
          transition: 'filter 0.5s ease', // 0.5秒かけてじわっと出る
          cursor: 'pointer'
        }}
      />

      <br />

      {/* まだ正解していない時だけボタンを表示 */}
      {!isRevealed ? (
        <button onClick={handleReveal} style={{ marginTop: '10px', padding: '10px 20px' }}>
          正解を見る！
        </button>
      ) : (
        // 正解後は名前を表示
        <h1 style={{ color: 'red' }}>{pokemon.name}！</h1>
      )}
    </div>
  );
};
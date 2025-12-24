"use client"; // ← 重要！これがないとHooksが動きません

import { useState, useEffect } from 'react';

// ポケモンの型（さっきと同じ）
interface Pokemon {
  name: string;
  weight: number; // 重さが必要！
  image: string;
}

export const WeightQuiz = ({ pokeA, pokeB }: { pokeA: Pokemon, pokeB: Pokemon }) => {
  const [result, setResult] = useState<string>(""); // "正解！" か "はずれ..." を入れる

  // 答え合わせのロジック
  const checkAnswer = (selected: Pokemon, other: Pokemon) => {
    // 選んだ方が重ければ勝ち！
    if (selected.weight >= other.weight) {
      setResult("正解！こうかは ばつぐんだ！");
    } else {
      setResult("ざんねん... めのまえが まっくらになった");
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>どっちが重い？</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '50px' }}>
        {/* ポケモンA */}
        <div onClick={() => checkAnswer(pokeA, pokeB)} style={{ cursor: 'pointer' }}>
          <img src={pokeA.image} width={150} />
          <p>{pokeA.name}</p>
        </div>

        <p style={{ marginTop: '50px' }}>VS</p>

        {/* ポケモンB */}
        <div onClick={() => checkAnswer(pokeB, pokeA)} style={{ cursor: 'pointer' }}>
          <img src={pokeB.image} width={150} />
          <p>{pokeB.name}</p>
        </div>
      </div>

      {/* 結果発表エリア */}
      {result && <h1>{result}</h1>}
    </div>
  );
};
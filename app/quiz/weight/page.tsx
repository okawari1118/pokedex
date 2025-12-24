"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
// --- 部品（コンポーネント）の定義 ---

interface Pokemon {
  name: string;
  weight: number; // これが重要！
  image: string;
}

// クイズパーツ
const WeightQuiz = ({ pokeA, pokeB }: { pokeA: Pokemon, pokeB: Pokemon }) => {
  const [result, setResult] = useState<string>(""); // 結果メッセージ
  const [isAnswered, setIsAnswered] = useState(false); // 回答したかどうか

  const checkAnswer = (selected: Pokemon, other: Pokemon) => {
    if (isAnswered) return; // 2回押せないようにする
    
    setIsAnswered(true);

    // 重さの比較ロジック
    if (selected.weight >= other.weight) {
      setResult("⭕️ 正解！こっちの方が重い！");
    } else {
      setResult("❌ 残念... 軽かった...");
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px' }}>どっちが重い？</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
        {/* ポケモンA */}
        <div 
            onClick={() => checkAnswer(pokeA, pokeB)} 
            style={{ cursor: 'pointer', padding: '10px', border: '2px solid #ddd', borderRadius: '10px', background: isAnswered && pokeA.weight >= pokeB.weight ? '#ffebee' : 'white' }}
        >
          <img src={pokeA.image} width={120} height={120} alt={pokeA.name} />
          <p style={{ fontWeight: 'bold' }}>{pokeA.name}</p>
          {/* 正解後に重さを表示 */}
          {isAnswered && <p>{pokeA.weight / 10} kg</p>}
        </div>

        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>VS</div>

        {/* ポケモンB */}
        <div 
            onClick={() => checkAnswer(pokeB, pokeA)} 
            style={{ cursor: 'pointer', padding: '10px', border: '2px solid #ddd', borderRadius: '10px', background: isAnswered && pokeB.weight >= pokeA.weight ? '#ffebee' : 'white' }}
        >
          <img src={pokeB.image} width={120} height={120} alt={pokeB.name} />
          <p style={{ fontWeight: 'bold' }}>{pokeB.name}</p>
          {isAnswered && <p>{pokeB.weight / 10} kg</p>}
        </div>
      </div>

      {/* 結果発表エリア */}
      <div style={{ height: '80px', marginTop: '20px' }}>
        {result && (
            <div>
                <h2 style={{ color: result.includes("正解") ? 'red' : 'blue' }}>{result}</h2>
                <button 
                    onClick={() => window.location.reload()} 
                    style={{ marginTop: '10px', padding: '5px 20px', cursor: 'pointer' }}
                >
                    次の対決へ
                </button>
            </div>
        )}
              <div style={{ marginTop: "30px" }}>
        <Link href="/">← 図鑑に戻る</Link>
      </div>
      </div>
    </div>
    
  );
};

// --- ページ本体（ここが重要！） ---

export default function WeightPage() {
  const [pokeA, setPokeA] = useState<Pokemon | null>(null);
  const [pokeB, setPokeB] = useState<Pokemon | null>(null);

  // ポケモンデータを1匹取ってくるヘルパー関数
  const fetchRandomPokemon = async () => {
    const id = Math.floor(Math.random() * 1025) + 1;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    
    // 日本語名取得（簡易版：失敗したら英語名のまま）
    let jaName = data.name;
    try {
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();
        const jaNameObj = speciesData.names.find((n: any) => n.language.name === "ja");
        if(jaNameObj) jaName = jaNameObj.name;
    } catch(e) {}

    return {
      name: jaName,
      weight: data.weight,
      image: data.sprites.front_default
    };
  };

  useEffect(() => {
    // 2匹同時に取ってくる！
    const init = async () => {
        const a = await fetchRandomPokemon();
        const b = await fetchRandomPokemon();
        setPokeA(a);
        setPokeB(b);
    };
    init();
  }, []);

  if (!pokeA || !pokeB) return <div style={{ textAlign: 'center', marginTop: '100px' }}>レフェリー準備中...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9f9', paddingTop: '50px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
            <WeightQuiz pokeA={pokeA} pokeB={pokeB} />
        </div>
        
    </main>
  );
}
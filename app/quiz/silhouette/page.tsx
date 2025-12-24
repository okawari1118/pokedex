"use client"; // ← 重要！これがないとHooksが動きません

import { useState, useEffect } from 'react';
import Link from "next/link";
// --- ここから：部品の定義 ---

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
    // エラー回避のため、音声データがある場合のみ再生
    if(pokemon.cries) {
        const audio = new Audio(pokemon.cries);
        audio.play().catch(e => console.log("音声再生エラー:", e));
    }
  };

  const handleReveal = () => {
    setIsRevealed(true); // 画像を表示
    playCry();           // 正解と同時に鳴き声を出す！
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3 style={{marginBottom: '20px'}}>このポケモンだ〜れだ？</h3>
      
      {/* ポケモン画像 */}
      <div style={{ minHeight: '220px' }}>
        <img 
            src={pokemon.image} 
            alt="ポケモン"
            width={200}
            height={200}
            style={{ 
            // isRevealedがfalseなら黒くする、trueならそのまま
            filter: isRevealed ? 'none' : 'brightness(0)',
            transition: 'filter 0.5s ease', // 0.5秒かけてじわっと出る
            cursor: 'pointer'
            }}
        />
      </div>

      <br />

      {/* まだ正解していない時だけボタンを表示 */}
      {!isRevealed ? (
        <button onClick={handleReveal} style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          正解を見る！
        </button>
      ) : (
        // 正解後は名前を表示
        <div style={{animation: 'fadeIn 0.5s'}}>
            <h1 style={{ color: '#ff0000', fontSize: '2rem' }}>{pokemon.name}！</h1>
            <button 
                onClick={() => window.location.reload()} 
                style={{ marginTop: '20px', padding: '5px 15px', cursor: 'pointer' }}
            >
                次の問題へ
            </button>
        </div>
      )}
                    <div style={{ marginTop: "30px" }}>
        <Link href="/">← 図鑑に戻る</Link>
      </div>
    </div>
  );
};

// --- ここから下：足りなかった「ページ本体」 ---

// ⚠️ ここに export default が必要です！！
export default function SilhouettePage() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    // ランダムなID（1〜151）を作る
    const randomId = Math.floor(Math.random() * 1025) + 1;

    fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
      .then(res => res.json())
      .then(async (data) => {
        // 日本語名を取得する（おまけ機能）
        let jaName = data.name;
        try {
             const speciesRes = await fetch(data.species.url);
             const speciesData = await speciesRes.json();
             const jaNameObj = speciesData.names.find((n: any) => n.language.name === "ja");
             if(jaNameObj) jaName = jaNameObj.name;
        } catch(e) {
            console.log(e);
        }

        setPokemon({
          id: data.id,
          name: jaName, 
          image: data.sprites.front_default,
          cries: data.cries.latest
        });
      });
  }, []); // 最初の1回だけ実行

  // データ読み込み中は「ロード中」と出す
  if (!pokemon) return <div style={{ textAlign: 'center', marginTop: '100px' }}>ロード中...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#fff', paddingTop: '50px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', border: '2px solid #eee', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <SilhouetteQuiz pokemon={pokemon} />
        </div>
    </main>
  );
}
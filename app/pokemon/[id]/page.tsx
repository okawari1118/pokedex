"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // URLのIDを取得するフック

// --- 1. 型定義 ---
interface PokemonDetail {
  id: number;
  name: string;      // 日本語名
  enName: string;    // 英語名
  image: string;
  types: string[];   // タイプ（日本語）
  height: number;
  weight: number;
  flavorText: string; // 図鑑説明文
  stats: {           // ステータス
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  cries: string;     // 鳴き声
}

// --- 2. タイプの配色リスト（こだわりポイント！） ---
const typeColors: { [key: string]: string } = {
  ノーマル: '#A8A77A',
  ほのお: '#EE8130',
  みず: '#6390F0',
  でんき: '#F7D02C',
  くさ: '#7AC74C',
  こおり: '#96D9D6',
  かくとう: '#C22E28',
  どく: '#A33EA1',
  じめん: '#E2BF65',
  ひこう: '#A98FF3',
  エスパー: '#F95587',
  むし: '#A6B91A',
  いわ: '#B6A136',
  ゴースト: '#735797',
  ドラゴン: '#6F35FC',
  あく: '#705746',
  はがね: '#B7B7CE',
  フェアリー: '#D685AD',
};

// --- 3. メインコンポーネント ---
export default function PokemonDetailPage() {
  const params = useParams(); // URLから id を取得
  const id = params.id as string;
  
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // 基本データの取得
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await res.json();

        // 日本語データの取得（説明文や名前）
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();

        // 日本語名を探す
        const jaName = speciesData.names.find((n: any) => n.language.name === "ja")?.name || data.name;

        // 日本語の説明文を探す（改行文字を削除して綺麗にする）
        const flavorTextEntry = speciesData.flavor_text_entries.find((t: any) => t.language.name === "ja");
        const flavorText = flavorTextEntry 
          ? flavorTextEntry.flavor_text.replace(/[\n\f]/g, " ") 
          : "データなし";

        // タイプを日本語に変換するための辞書（簡易版）
        // 本来はAPIから取れますが、今回はマッピングで対応
        const typeMapping: {[key:string]: string} = {
            normal:"ノーマル", fire:"ほのお", water:"みず", electric:"でんき", grass:"くさ", ice:"こおり",
            fighting:"かくとう", poison:"どく", ground:"じめん", flying:"ひこう", psychic:"エスパー",
            bug:"むし", rock:"いわ", ghost:"ゴースト", dragon:"ドラゴン", dark:"あく", steel:"はがね", fairy:"フェアリー"
        };

        const jaTypes = data.types.map((t: any) => typeMapping[t.type.name] || t.type.name);

        setPokemon({
          id: data.id,
          name: jaName,
          enName: data.name,
          image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default, // 高画質な画像があればそっちを使う
          types: jaTypes,
          height: data.height / 10, // m単位に
          weight: data.weight / 10, // kg単位に
          flavorText: flavorText,
          stats: {
            hp: data.stats[0].base_stat,
            attack: data.stats[1].base_stat,
            defense: data.stats[2].base_stat,
            speed: data.stats[5].base_stat,
          },
          cries: data.cries.latest
        });

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  if (!pokemon) return <div style={{textAlign: 'center', marginTop: '50px'}}>ロード中...</div>;

  // 鳴き声再生
  const playCry = () => {
    if(pokemon.cries) {
        const audio = new Audio(pokemon.cries);
        audio.volume = 0.3;
        audio.play();
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      
      {/* 戻るボタン */}
      <Link href="/" style={{ textDecoration: 'none', color: '#666', fontWeight: 'bold' }}>
        ← 図鑑に戻る
      </Link>

      {/* メインカード */}
      <div style={{
        maxWidth: '600px',
        margin: '20px auto',
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', // リッチな影
        textAlign: 'center'
      }}>
        
        {/* IDと名前 */}
        <p style={{ color: '#888', fontWeight: 'bold' }}>No.{pokemon.id}</p>
        <h1 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{pokemon.name}</h1>
        
        {/* タイプ表示（色付きバッジ） */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          {pokemon.types.map((type) => (
            <span key={type} style={{
              backgroundColor: typeColors[type] || '#777', // タイプごとの色
              color: 'white',
              padding: '5px 15px',
              borderRadius: '20px',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
              {type}
            </span>
          ))}
        </div>

        {/* 画像（クリックで鳴き声） */}
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={playCry}>
            <img 
              src={pokemon.image} 
              alt={pokemon.name} 
              style={{ width: '100%', maxWidth: '300px', height: 'auto' }} 
            />
            <p style={{fontSize: '12px', color: '#aaa'}}>🔊 タップして鳴き声をきく</p>
        </div>

        {/* 図鑑説明文エリア */}
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '15px',
          borderRadius: '10px',
          margin: '20px 0',
          textAlign: 'left',
          lineHeight: '1.6',
          color: '#444',
          border: '1px solid #eee'
        }}>
          {pokemon.flavorText}
        </div>

        {/* ステータスバー（棒グラフ） */}
        <div style={{ textAlign: 'left', marginTop: '30px' }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>のうりょく</h3>
          
          <StatBar label="HP" value={pokemon.stats.hp} color="#FF5959" />
          <StatBar label="こうげき" value={pokemon.stats.attack} color="#F5AC78" />
          <StatBar label="ぼうぎょ" value={pokemon.stats.defense} color="#FAE078" />
          <StatBar label="すばやさ" value={pokemon.stats.speed} color="#FA92B2" />
        </div>

        {/* 基本情報 */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '30px', background: '#f0f8ff', padding: '15px', borderRadius: '10px' }}>
            <div>
                <p style={{fontSize: '12px', color: '#666'}}>たかさ</p>
                <p style={{fontWeight: 'bold', fontSize: '1.2rem'}}>{pokemon.height} m</p>
            </div>
            <div>
                <p style={{fontSize: '12px', color: '#666'}}>おもさ</p>
                <p style={{fontWeight: 'bold', fontSize: '1.2rem'}}>{pokemon.weight} kg</p>
            </div>
        </div>

      </div>
    </main>
  );
}

// --- 4. 棒グラフ用の小さな部品 ---
const StatBar = ({ label, value, color }: { label: string, value: number, color: string }) => {
  // 最大値を仮に150として割合を計算（バーの長さ）
  const percent = Math.min((value / 150) * 100, 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <span style={{ width: '70px', fontWeight: 'bold', fontSize: '14px', color: '#555' }}>{label}</span>
      <span style={{ width: '40px', textAlign: 'right', paddingRight: '10px', fontSize: '14px' }}>{value}</span>
      <div style={{ flex: 1, backgroundColor: '#eee', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
        <div style={{
          width: `${percent}%`,
          backgroundColor: color,
          height: '100%',
          borderRadius: '10px',
          transition: 'width 1s ease-out'
        }} />
      </div>
    </div>
  );
};
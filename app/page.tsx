// app/page.tsx
import Link from "next/link";

// --- 型定義 ---
type Pokemon = {
  name: string;
  url: string;
};

type PokemonListResponse = {
  count: number;
  results: Pokemon[];
};

type PokemonWithJaName = {
  id: string;
  enName: string;
  jaName: string;
  imageUrl: string;
};

// --- スタイル定義 (CSS in JS) ---
const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // レスポンシブ対応
    gap: '20px',
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', // 浮いているような影
    transition: 'transform 0.2s',
    cursor: 'pointer',
    border: '2px solid #f0f0f0',
    textDecoration: 'none',
    display: 'block', // Linkタグ用
    color: '#333',
  },
  // クイズボタン共通スタイル
  quizButtonBase: {
    display: 'block',
    width: '100%',
    maxWidth: '300px',
    margin: '10px auto', // 上下の隙間
    padding: '15px',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    borderRadius: '50px',
    border: 'none',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    textAlign: 'center' as const,
    textDecoration: 'none',
  }
};

// --- データ取得ロジック ---

// 1. 日本語名を取る関数
async function getJapaneseName(id: string) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    if (!response.ok) return "データなし";
    const data = await response.json();
    const jaNameObj = data.names.find((n: any) => n.language.name === "ja");
    return jaNameObj ? jaNameObj.name : "不明";
  } catch (e) {
    return "エラー";
  }
}

// 2. リスト作成のメイン関数
async function getPokemonList(): Promise<PokemonWithJaName[]> {

  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data: PokemonListResponse = await response.json();

  const promises = data.results.map(async (pokemon) => {
    const id = pokemon.url.split("/").filter(Boolean).pop() as string;
    
    // 日本語名を取得
    const jaName = await getJapaneseName(id);

    return {
      id: id,
      enName: pokemon.name,
      jaName: jaName,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    };
  });

  const pokemonList = await Promise.all(promises);
  return pokemonList;
}

// --- ページ本体 ---
export default async function Home() {
  const pokemonList = await getPokemonList();

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* ヘッダーエリア */}
      <div style={{ backgroundColor: '#cc0000', padding: '20px', color: 'white', textAlign: 'center', marginBottom: '30px' }}>
        <h1>ポケモン図鑑</h1>
      </div>

      {/* クイズへの誘導ボタンエリア */}
      <div style={{ marginBottom: '40px' }}>
        <Link href="/quiz/silhouette" style={{ ...styles.quizButtonBase, backgroundColor: '#ff5555' }}>
          🎮 シルエットクイズ
        </Link>
        <Link href="/quiz/weight" style={{ ...styles.quizButtonBase, backgroundColor: '#3366cc' }}>
          ⚖️ 重さ比べクイズ
        </Link>
      </div>

      <h2 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>ポケモン一覧</h2>

      {/* グリッドレイアウト適用 */}
      <div style={styles.grid}>
        {pokemonList.map((pokemon) => {
          return (
            <Link 
              href={`/pokemon/${pokemon.id}`} 
              key={pokemon.id} 
              style={styles.card} // 定義したスタイルを一発適用！
            >
              <img src={pokemon.imageUrl} alt={pokemon.jaName} width={100} height={100} />
              
              <p style={{ fontWeight: "bold", fontSize: "1.1rem", margin: "10px 0 5px" }}>
                {pokemon.jaName}
              </p>
              
              <p style={{ fontSize: "12px", color: "#888" }}>
                No.{pokemon.id} / {pokemon.enName}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
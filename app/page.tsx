// app/page.tsx
import Link from "next/link"; // 🆕 追加
// データの型定義
type Pokemon = {
  name: string;
  url: string;
};

type PokemonListResponse = {
  count: number;
  results: Pokemon[];
};

// 最終的に表示したいデータの形
type PokemonWithJaName = {
  id: string;
  enName: string;
  jaName: string;
  imageUrl: string;
};


// 1. 日本語名を取る関数（詳細ページと同じロジック）
async function getJapaneseName(id: string) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  const data = await response.json();
  const jaNameObj = data.names.find((n: any) => n.language.name === "ja");
  return jaNameObj ? jaNameObj.name : "不明";
}
// 2. リスト作成のメイン関数（ここが改造ポイント！）
async function getPokemonList(): Promise<PokemonWithJaName[]> {
  // まず20匹の英語リストを取得
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data: PokemonListResponse = await response.json();

  // 🚀 20回の通信を一斉に予約する（まだ待たない）
  // mapの中に async を書くと、結果は「データの入った箱(Promise)」の配列になります
  const promises = data.results.map(async (pokemon) => {
    // URLからIDを取り出す魔法: "https://.../1/" -> "1"
    const id = pokemon.url.split("/").filter(Boolean).pop() as string;
    
    // 日本語名を取りに行く（非同期）
    const jaName = await getJapaneseName(id);

    // 綺麗なデータを作って返す
    return {
      id: id,
      enName: pokemon.name,
      jaName: jaName,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    };
  });

// ⏰ Promise.all: 「全員のデータが揃うまで待つ！」
  // これで、一番遅い通信の時間だけで済みます
  const pokemonList = await Promise.all(promises);
  
  return pokemonList;
}

export default async function Home() {
  const pokemonList = await getPokemonList();

  return (
    <main style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>ポケモン図鑑</h1>
      <Link href={`/quiz`} >
      クイズを解く
      </Link>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        {pokemonList.map((pokemon) => {
          
          return (
            <Link 
              href={`/pokemon/${pokemon.id}`} 
              key={pokemon.id} 
              style={{ 
                border: "1px solid #ccc", 
                borderRadius: "8px", 
                padding: "10px", 
                textAlign: "center",
                backgroundColor: "#fff",
                color: "#333",
                textDecoration: "none",
                display: "block"
              }}
            >
              
              <p style={{ fontWeight: "bold" }}>
                No.{pokemon.id}
              </p>
              <img src={pokemon.imageUrl} alt={pokemon.jaName} width={100} height={100} />
              <p style={{ fontWeight: "bold" }}>
                {pokemon.jaName}
              </p>
              {/* 英語名も小さく表示しておくと親切かも */}
              <p style={{ fontSize: "12px", color: "#666" }}>
                {pokemon.enName}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
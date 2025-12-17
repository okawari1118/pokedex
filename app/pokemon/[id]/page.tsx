// app/pokemon/[id]/page.tsx
import Link from "next/link";

// --- 型定義 ---

// 1. 基本データ（画像など）
type PokemonDetail = {
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
};

// 2. 名前データ（日本語を探すため）
type PokemonSpecies = {
  names: {
    name: string;
    language: {
      name: string;
    };
  }[];
};

// --- データ取得関数 ---

// 基本データを取る
async function getPokemon(id: string) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data: PokemonDetail = await response.json();
  return data;
}

// 🆕 日本語名を取る（Speciesデータを叩く）
async function getJapaneseName(id: string) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  const data: PokemonSpecies = await response.json();

  // data.names の中から、language.name が "ja" (日本語) のものを探す
  // find() は filter() の親戚で、「条件に合う最初の1つ」を見つけます
  const japaneseNameObj = data.names.find((n) => n.language.name === "ja");

  // 見つかったらその名前を返す（なければ英語名を返す）
  return japaneseNameObj ? japaneseNameObj.name : "不明";
}

// --- ページコンポーネント ---

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // ⭐️ 2つのデータを同時に取得（並列処理）
  // Promise.allを使うと、2つのfetchを同時にスタートさせるので速いです
  const [pokemon, jaName] = await Promise.all([
    getPokemon(id),
    getJapaneseName(id)
  ]);

  return (
    <main style={{ padding: "20px", textAlign: "center", maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px", textAlign: "left" }}>
        <Link href="/" style={{ textDecoration: "none", color: "blue" }}>
          ← 戻る
        </Link>
      </div>

      <div style={{ border: "2px solid #333", borderRadius: "10px", padding: "20px" }}>
        {/* 英語名ではなく、取得した日本語名を表示！ */}
        <h1 style={{ fontWeight: "bold" }}>
          No.{id} {jaName}
        </h1>
        
        <img 
          src={pokemon.sprites.front_default} 
          alt={jaName} 
          width={200} 
          height={200} 
        />

        <div style={{ textAlign: "left", marginTop: "20px" }}>
          <p><strong>英語名:</strong> {pokemon.name}</p>
          <p><strong>高さ:</strong> {pokemon.height / 10} m</p>
          <p><strong>重さ:</strong> {pokemon.weight / 10} kg</p>
          <p><strong>タイプ:</strong> {pokemon.types.map(t => t.type.name).join(", ")}</p>
        </div>
      </div>
    </main>
  );
}
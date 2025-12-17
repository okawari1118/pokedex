// app/quiz/page.tsx
"use client"; // 👈 これが超重要！「ここはブラウザで動くJSですよ」という宣言

import { useState, useEffect } from "react";
import Link from "next/link";

// --- 型定義 ---
type QuizData = {
  id: number;
  jaName: string; // 正解の名前（日本語）
  imageUrl: string;
  types: string[]; // ヒント用のタイプ（日本語）
};

// タイプの日本語変換リスト（簡易版）
const typeTranslations: { [key: string]: string } = {
  normal: "ノーマル", fire: "ほのお", water: "みず", electric: "でんき",
  grass: "くさ", ice: "こおり", fighting: "かくとう", poison: "どく",
  ground: "じめん", flying: "ひこう", psychic: "エスパー", bug: "むし",
  rock: "いわ", ghost: "ゴースト", dragon: "ドラゴン", steel: "はがね",
  dark: "あく", fairy: "フェアリー"
};

export default function QuizPage() {
  // --- State（状態管理） ---
  const [quizData, setQuizData] = useState<QuizData | null>(null); // 現在の問題
  const [loading, setLoading] = useState(false);     // 読み込み中フラグ
  const [inputAnswer, setInputAnswer] = useState(""); // ユーザーの入力値
  const [gameStatus, setGameStatus] = useState<"playing" | "correct" | "incorrect">("playing"); // ゲームの状態
  const [showHint, setShowHint] = useState(false);   // ヒントを表示するか

  // --- 関数: 新しい問題を作る ---
  const fetchNewQuiz = async () => {
    setLoading(true);
    setGameStatus("playing");
    setInputAnswer("");
    setShowHint(false);

    // 1. ランダムなID (1〜151)
    const randomId = Math.floor(Math.random() * 151) + 1;

    // 2. データを並列取得（基本データ + 日本語名）
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`)
    ]);

    const pokemon = await pokemonRes.json();
    const species = await speciesRes.json();

    // 3. 必要なデータを取り出す
    const jaNameObj = species.names.find((n: any) => n.language.name === "ja");
    const jaName = jaNameObj ? jaNameObj.name : "不明";
    
    // タイプを日本語に変換して配列にする
    const types = pokemon.types.map((t: any) => typeTranslations[t.type.name] || t.type.name);

    setQuizData({
      id: randomId,
      jaName: jaName,
      imageUrl: pokemon.sprites.front_default,
      types: types,
    });

    setLoading(false);
  };

  // --- 関数: 答え合わせ ---
  const checkAnswer = () => {
    if (!quizData) return;

    if (inputAnswer === quizData.jaName) {
      setGameStatus("correct");
    } else {
      setGameStatus("incorrect");
    }
  };

  // 最初の1回だけ実行
  useEffect(() => {
    fetchNewQuiz();
  }, []);

  // --- 表示部分 (JSX) ---
  return (
    <main style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ marginBottom: "20px" }}>ポケモン クイズ</h1>

      {/* 読み込み中 or データあり */}
      {loading || !quizData ? (
        <p>問題を探しています...</p>
      ) : (
        <div style={{ border: "2px solid #333", borderRadius: "10px", padding: "30px" }}>
          
          {/* 問題表示エリア */}
          <h2 style={{ fontSize: "40px", marginBottom: "20px" }}>
            No.{quizData.id}
          </h2>

          {/* 正解した時だけ画像と名前を表示 */}
          {gameStatus === "correct" ? (
            <div style={{ animation: "fadeIn 0.5s" }}>
              <img src={quizData.imageUrl} alt="正解画像" width={150} />
              <h2 style={{ color: "red", fontSize: "30px" }}>{quizData.jaName}</h2>
              <p style={{ fontSize: "20px", fontWeight: "bold", color: "#e91e63" }}>正解！</p>
              <button onClick={fetchNewQuiz} style={buttonStyle}>次の問題へ</button>
            </div>
          ) : (
            // プレイ中の表示
            <div>
              <p>このポケモンの名前は？</p>
              
              {/* ヒントエリア */}
              <div style={{ margin: "20px 0", minHeight: "30px" }}>
                {showHint ? (
                  <span style={{ background: "#eee", color: "#333", padding: "5px 10px", borderRadius: "4px" }}>
                    タイプ: {quizData.types.join(" / ")}
                  </span>
                ) : (
                  <button onClick={() => setShowHint(true)} style={hintButtonStyle}>
                    💡 ヒントを見る
                  </button>
                )}
              </div>

              {/* 入力フォーム */}
              <input
                type="text"
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                placeholder="名前を入力（例: ピカチュウ）"
                style={inputStyle}
              />
              
              <div style={{ marginTop: "10px" }}>
                <button onClick={checkAnswer} style={answerButtonStyle}>答える</button>
              </div>

              {/* 不正解メッセージ */}
              {gameStatus === "incorrect" && (
                <p style={{ color: "#yellow", marginTop: "10px" }}>残念！もう一度！</p>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <Link href="/">← 図鑑に戻る</Link>
      </div>
    </main>
  );
}

// --- CSSスタイル（簡易的） ---
const inputStyle = { padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc", width: "80%" };
const buttonStyle = { padding: "10px 20px", fontSize: "16px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px" };
const answerButtonStyle = { ...buttonStyle, background: "#2196F3" };
const hintButtonStyle = { padding: "5px 10px", fontSize: "14px", background: "#FFC107", border: "none", borderRadius: "5px", cursor: "pointer" };
import React, { useState, useMemo, useEffect } from "react";

// ══════════════════════════════════════════════
// 🏝️ Animal Crossing Budget Tracker - 호두네 가계부 (Google Sheets 연동 버전)
// ══════════════════════════════════════════════

export default function BudgetApp() {
  // 1. 데이터를 담을 그릇 (처음엔 비어있음)
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. 화면 상태 관리
  const [tab, setTab] = useState("home");
  const [month, setMonth] = useState("01");

  // 3. 구글 시트 데이터 가져오기 (앱 켜질 때 1번 실행)
  useEffect(() => {
    // 🚨 [필수] 아래 주소를 본인의 Apps Script 배포 주소로 꼭 바꾸세요! 🚨
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbyqDhKpmot6FuyVcSsbYbSBeaBZzFAAAE5_PWdc6qnkk3_quL1acG7b83mRJWpsU2ev/exec"; 
    
    // 주소가 비어있으면 실행 안 함
    if (SHEET_URL === "PUT_YOUR_WEB_APP_URL_HERE") {
        console.error("URL을 입력해주세요!");
        setLoading(false);
        return;
    }

    fetch(SHEET_URL)
      .then(res => res.json())
      .then(data => {
        console.log("가져온 데이터:", data); // 확인용 로그
        
        // 시트 데이터를 앱에서 쓰는 형식으로 변환
        const formattedData = data.map((item, index) => ({
          id: index, // 고유 번호 추가
          m: item.month ? item.month.replace("월", "").padStart(2, '0') : "00",
          t: item.구분 || "기타",
          d: item.일자 ? item.일자.slice(5) : "", // "2026-01-20" -> "01-20"
          desc: item.내용 || "내용 없음",
          cat: item.분류 || "기타",
          amt: Number(item.금액) || 0,
          pay: item.지출방식 || ""
        }));
        
        setTransactions(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("데이터 가져오기 실패:", err);
        setLoading(false);
      });
  }, []);

  // 4. 데이터 필터링 (선택한 탭, 월에 따라 보여줄 것만 남김)
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const isMonthMatch = t.m === month;
      if (!isMonthMatch) return false;
      if (tab === "home") return true; // 전체 보기
      if (tab === "food") return t.cat.includes("Groceries") || t.cat.includes("Dining");
      if (tab === "pet") return t.cat.includes("Pet");
      if (tab === "etc") return !t.cat.includes("Groceries") && !t.cat.includes("Dining") && !t.cat.includes("Pet");
      return true;
    });
  }, [tab, month, transactions]);

  // 5. 총 지출 계산
  const totalSpent = useMemo(() => filtered.reduce((acc, cur) => acc + cur.amt, 0), [filtered]);

  // 로딩 중일 때 화면
  if (loading) {
      return <div style={{ padding: 20, textAlign: "center" }}>데이터 불러오는 중...<br/>(잠시만 기다려주세요)</div>;
  }

  // 데이터가 없을 때 화면 (URL 안 넣었을 때 등)
  if (transactions.length === 0) {
      return (
        <div style={{ padding: 20, textAlign: "center", color: "red" }}>
          데이터가 없습니다.<br/>
          Apps Script URL을 코드에 넣었는지 확인해주세요!
        </div>
      );
  }

  return (
    <div style={{
      fontFamily: "'Gamja Flower', cursive, sans-serif",
      background: "#FFFBEB", minHeight: "100vh", paddingBottom: "80px",
      position: "relative", maxWidth: "420px", margin: "0 auto",
      boxShadow: "0 0 20px rgba(0,0,0,0.05)"
    }}>
      {/* 🏝️ Header */}
      <div style={{
        background: "#7BC67E", padding: "40px 20px 20px",
        borderRadius: "0 0 30px 30px", color: "white",
        boxShadow: "0 4px 12px rgba(123, 198, 126, 0.4)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: "20px", opacity: 0.9 }}>2026 호두네 가계부</h2>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
            <h1 style={{ margin: 0, fontSize: "42px", fontWeight: "bold" }}>
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h1>
            <span style={{ fontSize: "18px", opacity: 0.8 }}>지출</span>
          </div>
        </div>
        
        {/* 월 선택 버튼 */}
        <div style={{ display: "flex", gap: "8px", marginTop: "20px", overflowX: "auto", paddingBottom: "4px" }}>
          {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              style={{
                background: month === m ? "#FFFFFF" : "rgba(255,255,255,0.3)",
                color: month === m ? "#7BC67E" : "white",
                border: "none", borderRadius: "12px",
                padding: "6px 12px", fontSize: "14px", fontWeight: "bold",
                cursor: "pointer", flexShrink: 0
              }}
            >
              {m}월
            </button>
          ))}
        </div>
      </div>

      {/* 📝 List */}
      <div style={{ padding: "20px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", marginTop: "40px" }}>
            내역이 없어요 🍃
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((item, idx) => (
              <div key={idx} style={{
                background: "white", borderRadius: "20px", padding: "16px",
                display: "flex", alignItems: "center", gap: "16px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                border: "2px solid #F0EAD6"
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "16px",
                  background: getCategoryColor(item.cat),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", flexShrink: 0
                }}>
                  {getCategoryIcon(item.cat)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#5A4D41" }}>
                    {item.desc}
                  </div>
                  <div style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>
                    {item.d} • {item.pay}
                  </div>
                </div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#E17055" }}>
                  -${item.amt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🦶 Bottom Tab Bar */}
      <div style={{
        position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: "420px",
        padding: "0 20px", boxSizing: "border-box", zIndex: 10
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          background: "white", borderRadius: "24px", padding: "12px 24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "1px solid #eee"
        }}>
          <TabButton icon="🏠" label="전체" active={tab === "home"} onClick={() => setTab("home")} />
          <TabButton icon="🥗" label="식비" active={tab === "food"} onClick={() => setTab("food")} />
          <TabButton icon="🐾" label="호두" active={tab === "pet"} onClick={() => setTab("pet")} />
          <TabButton icon="🎸" label="기타" active={tab === "etc"} onClick={() => setTab("etc")} />
        </div>
      </div>
    </div>
  );
}

// 아이콘 & 색상 결정 도우미 함수들
function getCategoryIcon(cat) {
  if (cat.includes("Dining") || cat.includes("Groceries")) return "🥗";
  if (cat.includes("Pet")) return "🐾";
  if (cat.includes("Gas")) return "⛽";
  if (cat.includes("Bill")) return "🧾";
  if (cat.includes("쇼핑") || cat.includes("용돈")) return "🛍️";
  return "✨";
}

function getCategoryColor(cat) {
  if (cat.includes("Dining") || cat.includes("Groceries")) return "#FFEDB2"; // 노랑
  if (cat.includes("Pet")) return "#E0F2F1"; // 민트
  if (cat.includes("Gas") || cat.includes("Bill")) return "#FFEBEE"; // 분홍
  return "#F3E5F5"; // 보라
}

// 탭 버튼 컴포넌트
function TabButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
      opacity: active ? 1 : 0.4, transform: active ? "scale(1.1)" : "scale(1)",
      transition: "all 0.2s"
    }}>
      <span style={{ fontSize: "24px" }}>{icon}</span>
      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#555" }}>{label}</span>
    </button>
  );
}
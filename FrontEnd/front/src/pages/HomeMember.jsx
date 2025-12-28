import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function HomeMember() {
  const [items, setItems] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("news_public")
        .select("id,title,excerpt,pin_rank,created_at,expires_at")
        .gt("expires_at", new Date().toISOString())
        .order("pin_rank", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (!error) setItems(data || []);
      else console.error(error);
    })();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/index");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h1>SCPVB (Member)</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <h2>ข่าวสาร / ประกาศ</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:12 }}>
        {items.map(n => (
          <div key={n.id} style={{ border:"1px solid #ddd", borderRadius:12, padding:14 }}>
            {n.pin_rank ? <small>📌 ปักหมุด #{n.pin_rank}</small> : <small>&nbsp;</small>}
            <h3 style={{ margin:"6px 0" }}>{n.title}</h3>
            {n.excerpt && <p style={{ margin:0 }}>{n.excerpt}</p>}
            <div style={{ marginTop:10, display:"flex", justifyContent:"space-between" }}>
              <small>{new Date(n.created_at).toLocaleString()}</small>
              <button onClick={() => nav(`/news/${n.id}`)}>อ่านเต็ม</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

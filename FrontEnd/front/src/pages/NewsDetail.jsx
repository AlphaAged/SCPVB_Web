import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function NewsDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id,title,body,created_at,pin_rank")
        .eq("id", id)
        .single();

      if (error) setErr(error.message);
      else setItem(data);
    })();
  }, [id]);

  if (err) return <div style={{ padding: 20 }}>Error: {err}</div>;
  if (!item) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin:"0 auto", padding:20 }}>
      <button onClick={() => nav("/")}>← กลับ</button>
      {item.pin_rank ? <p>📌 ปักหมุด #{item.pin_rank}</p> : null}
      <h1>{item.title}</h1>
      <small>{new Date(item.created_at).toLocaleString()}</small>
      <hr />
      <div style={{ whiteSpace:"pre-wrap", lineHeight:1.6 }}>{item.body}</div>
    </div>
  );
}

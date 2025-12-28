import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";
import { formatStudentId, isStudentIdValidFormatted, makeInternalEmail } from "../utils";

export default function Login() {
  const [student, setStudent] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  const loc = useLocation();
  const nav = useNavigate();
  const from = loc.state?.from || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const formatted = formatStudentId(student);
    if (!isStudentIdValidFormatted(formatted)) {
      setMsg("รหัสนักศึกษาต้องเป็น 10 หลัก (รูปแบบ 000000000-0)");
      return;
    }

    const email = makeInternalEmail(formatted);

    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) {
      setMsg("ล็อกอินไม่สำเร็จ: ตรวจสอบรหัสนักศึกษา/รหัสผ่าน");
      return;
    }
    nav(from, { replace: true });
  };

  return (
    <div style={{ maxWidth: 420, margin:"0 auto", padding:20 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input
          placeholder="รหัสนักศึกษา (10 หลัก)"
          value={student}
          onChange={(e) => setStudent(e.target.value)}
          style={{ width:"100%", padding:10, marginBottom:10 }}
        />
        <input
          placeholder="รหัสผ่าน"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{ width:"100%", padding:10, marginBottom:10 }}
        />
        <button style={{ width:"100%", padding:10 }}>Login</button>
      </form>

      {msg && <p style={{ color:"crimson" }}>{msg}</p>}

      <p style={{ marginTop: 10 }}>
        ยังไม่มีบัญชี? <Link to="/register" state={{ from }}>Register</Link>
      </p>
      <p>
        <Link to="/index">กลับหน้า index</Link>
      </p>
    </div>
  );
}

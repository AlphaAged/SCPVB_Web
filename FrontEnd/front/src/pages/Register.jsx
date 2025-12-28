import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import {
  digitsOnly, formatStudentId, isStudentIdValidFormatted,
  isThaiPhone10Digits, isKkuMail, makeInternalEmail
} from "../utils";

const CONTACT_OPTIONS = [
  { type: "facebook", label: "Facebook" },
  { type: "line", label: "LINE" },
  { type: "instagram", label: "Instagram" },
  { type: "other", label: "Other" },
];

export default function Register() {
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/";

  // basic fields
  const [student, setStudent] = useState("");
  const [kkumail, setKkumail] = useState("");
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("male");
  const [phone, setPhone] = useState("");

  const [yearLevel, setYearLevel] = useState("1");
  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");

  const [health, setHealth] = useState("");
  const [invite, setInvite] = useState("SCPVB");

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  // contacts
  const [available, setAvailable] = useState(CONTACT_OPTIONS.map(x => x.type));
  const [contactType, setContactType] = useState("facebook");
  const [contactValue, setContactValue] = useState("");
  const [contacts, setContacts] = useState([]); // [{type,value}]

  // master lists
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);

  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data: f } = await supabase.from("faculties").select("name_th").order("name_th");
      setFaculties((f || []).map(x => x.name_th));

      const { data: m } = await supabase.from("majors").select("faculty_key,name_th");
      // store all majors; filter in UI
      setMajors(m || []);
    })();
  }, []);

  // update major dropdown when faculty changes
  const majorsForFaculty = majors
    .filter(m => (faculty === "วิทยาศาสตร์" ? m.faculty_key === "SCI" : m.faculty_key === "COM"))
    .map(m => m.name_th);

  useEffect(() => {
    if (!faculty) setMajor("");
    else setMajor("");
  }, [faculty]);

  const addContact = () => {
    setMsg("");
    if (!contactType) return;
    if (!contactValue.trim()) {
      setMsg("กรอกค่าช่องทางติดต่อก่อน");
      return;
    }
    // prevent dup
    if (contacts.some(c => c.type === contactType)) {
      setMsg("ช่องทางนี้ถูกเพิ่มแล้ว");
      return;
    }

    const next = [...contacts, { type: contactType, value: contactValue.trim() }];
    setContacts(next);

    // remove used option
    const newAvail = available.filter(t => t !== contactType);
    setAvailable(newAvail);

    // reset to next available type
    setContactValue("");
    setContactType(newAvail.includes("facebook") ? "facebook" : (newAvail[0] || ""));
  };

  const removeContact = (type) => {
    const next = contacts.filter(c => c.type !== type);
    setContacts(next);

    // put option back
    const newAvail = Array.from(new Set([...available, type]));
    // keep consistent order
    const ordered = CONTACT_OPTIONS.map(x => x.type).filter(t => newAvail.includes(t));
    setAvailable(ordered);

    // if current type empty, set to facebook if available
    if (!contactType || !ordered.includes(contactType)) {
      setContactType(ordered.includes("facebook") ? "facebook" : (ordered[0] || ""));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (invite !== "SCPVB") return setMsg("Invite code ไม่ถูกต้อง (ต้องเป็น SCPVB)");
    const sidFormatted = formatStudentId(student);
    if (!isStudentIdValidFormatted(sidFormatted)) return setMsg("รหัสนักศึกษาไม่ถูกต้อง (ต้องเป็น 10 หลัก เช่น 000000000-0)");

    if (!isKkuMail(kkumail)) return setMsg("ต้องใช้อีเมล @kkumail.com เท่านั้น");
    if (!fullName.trim()) return setMsg("กรอกชื่อจริง");
    if (!faculty) return setMsg("เลือกคณะ");
    if (!major) return setMsg("เลือกสาขา");

    const phoneDigits = digitsOnly(phone);
    if (!isThaiPhone10Digits(phoneDigits)) return setMsg("เบอร์โทรต้องเป็นตัวเลข 10 หลัก");

    if (!pw || pw.length < 6) return setMsg("รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร");
    if (pw !== pw2) return setMsg("รหัสผ่าน 2 ช่องไม่ตรงกัน");

    // Facebook required
    const hasFacebook = contacts.some(c => c.type === "facebook") ||
                        (contactType === "facebook" && contactValue.trim() !== "");
    // if user typed facebook in current input but hasn't pressed add, auto add it
    let finalContacts = [...contacts];
    if (contactType && contactValue.trim()) {
      // allow add the last input as well
      finalContacts = finalContacts.filter(c => c.type !== contactType);
      finalContacts.push({ type: contactType, value: contactValue.trim() });
    }
    if (!finalContacts.some(c => c.type === "facebook")) return setMsg("ต้องกรอก Facebook อย่างน้อย 1 ช่อง");

    // Build internal email (login identifier)
    const internalEmail = makeInternalEmail(sidFormatted);

    // Put everything into metadata so DB trigger can create profile+contacts
    const meta = {
      invite_code: "SCPVB",
      student_id: sidFormatted,
      kkumail: kkumail.trim(),
      full_name: fullName.trim(),
      nickname: nickname.trim(),
      gender,
      phone_digits: phoneDigits,
      year_level: yearLevel,
      faculty,
      major,
      health_note: health.trim(),
      contacts: finalContacts
    };

    const { error } = await supabase.auth.signUp({
      email: internalEmail,
      password: pw,
      options: { data: meta }
    });

    if (error) {
      setMsg(`สมัครไม่สำเร็จ: ${error.message}`);
      return;
    }

    // If email confirmation is OFF, user should be logged in immediately
    nav(from, { replace: true });
  };

  return (
    <div style={{ maxWidth: 720, margin:"0 auto", padding:20 }}>
      <h2>Register (SCPVB)</h2>

      <form onSubmit={onSubmit}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div>
            <label>Invite code</label>
            <input value={invite} onChange={(e)=>setInvite(e.target.value)} style={{ width:"100%", padding:10 }} />
          </div>
          <div>
            <label>อีเมล @kkumail.com</label>
            <input value={kkumail} onChange={(e)=>setKkumail(e.target.value)} style={{ width:"100%", padding:10 }} />
          </div>

          <div>
            <label>รหัสนักศึกษา (10 หลัก)</label>
            <input value={student} onChange={(e)=>setStudent(e.target.value)} placeholder="0000000000" style={{ width:"100%", padding:10 }} />
            <small>จะแสดงเป็น: {formatStudentId(student)}</small>
          </div>
          <div>
            <label>เบอร์โทร (ตัวเลขล้วน)</label>
            <input value={phone} onChange={(e)=>setPhone(digitsOnly(e.target.value))} placeholder="0xxxxxxxxx" style={{ width:"100%", padding:10 }} />
          </div>

          <div>
            <label>ชื่อจริง</label>
            <input value={fullName} onChange={(e)=>setFullName(e.target.value)} style={{ width:"100%", padding:10 }} />
          </div>
          <div>
            <label>ชื่อเล่น</label>
            <input value={nickname} onChange={(e)=>setNickname(e.target.value)} style={{ width:"100%", padding:10 }} />
          </div>

          <div>
            <label>เพศ</label>
            <select value={gender} onChange={(e)=>setGender(e.target.value)} style={{ width:"100%", padding:10 }}>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
            </select>
          </div>
          <div>
            <label>ชั้นปี</label>
            <select value={yearLevel} onChange={(e)=>setYearLevel(e.target.value)} style={{ width:"100%", padding:10 }}>
              <option value="1">ปี 1</option>
              <option value="2">ปี 2</option>
              <option value="3">ปี 3</option>
              <option value="4">ปี 4</option>
              <option value="alumni">ศิษย์เก่า</option>
            </select>
          </div>

          <div>
            <label>คณะ</label>
            <select value={faculty} onChange={(e)=>setFaculty(e.target.value)} style={{ width:"100%", padding:10 }}>
              <option value="">-- เลือกคณะ --</option>
              {faculties.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label>สาขา</label>
            <select value={major} onChange={(e)=>setMajor(e.target.value)} style={{ width:"100%", padding:10 }} disabled={!faculty}>
              <option value="">-- เลือกสาขา --</option>
              {majorsForFaculty.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>โรคประจำตัว (admin/พี่หม่อพลัสดูได้)</label>
          <textarea value={health} onChange={(e)=>setHealth(e.target.value)} style={{ width:"100%", padding:10, minHeight:80 }} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>ช่องทางติดต่อ (Facebook บังคับ)</label>
          <div style={{ display:"grid", gridTemplateColumns:"160px 1fr 110px", gap:8 }}>
            <select value={contactType} onChange={(e)=>setContactType(e.target.value)} style={{ padding:10 }}>
              {available.map(t => (
                <option key={t} value={t}>{CONTACT_OPTIONS.find(x=>x.type===t)?.label}</option>
              ))}
            </select>
            <input value={contactValue} onChange={(e)=>setContactValue(e.target.value)} placeholder="ใส่ลิงก์/ชื่อผู้ใช้" style={{ padding:10 }} />
            <button type="button" onClick={addContact}>เพิ่ม</button>
          </div>

          {contacts.length > 0 && (
            <ul style={{ marginTop: 10 }}>
              {contacts.map(c => (
                <li key={c.type} style={{ marginBottom: 6 }}>
                  <b>{CONTACT_OPTIONS.find(x=>x.type===c.type)?.label}:</b> {c.value}{" "}
                  <button type="button" onClick={() => removeContact(c.type)}>ลบ</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginTop: 12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div>
            <label>รหัสผ่าน</label>
            <input type="password" value={pw} onChange={(e)=>setPw(e.target.value)} style={{ width:"100%", padding:10 }} />
          </div>
          <div>
            <label>ยืนยันรหัสผ่าน</label>
            <input type="password" value={pw2} onChange={(e)=>setPw2(e.target.value)} style={{ width:"100%", padding:10 }} />
          </div>
        </div>

        <button style={{ width:"100%", padding:12, marginTop: 14 }}>สร้างบัญชี</button>
      </form>

      {msg && <p style={{ color:"crimson", marginTop:10 }}>{msg}</p>}
    </div>
  );
}

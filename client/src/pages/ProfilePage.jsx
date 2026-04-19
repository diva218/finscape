import { useEffect, useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import { motion } from "framer-motion";
import AppFrame from "../components/AppFrame";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import CuteButton from "../components/CuteButton";
import GradientText from "../components/GradientText";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ income: 0, expenses: 0, riskTolerance: "moderate", theme: "light" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      income: user.income || 0,
      expenses: user.expenses || 0,
      riskTolerance: user.riskTolerance || "moderate",
      theme: user.theme || "light"
    });
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", form.theme === "dark");
  }, [form.theme]);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      await updateProfile(form);
      showToast("Profile updated", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppFrame>
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        onSubmit={handleSubmit}
        className="glass-card pastel-border max-w-2xl p-5 md:p-6"
      >
        <GradientText as="h1" className="font-[Poppins] text-3xl font-extrabold">Profile</GradientText>
        <p className="cute-subtext mt-1 text-sm">Customize your preferences and risk vibe</p>
        <div className="mt-4 grid gap-4">
          <TextField type="number" label="Income" value={form.income} onChange={(e) => setForm((prev) => ({ ...prev, income: Number(e.target.value) }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", background: "#fff", "& fieldset": { borderColor: "#d8c1de" }, "&:hover fieldset": { borderColor: "#cdb4db" }, "&.Mui-focused fieldset": { borderColor: "#a2d2ff" } } }} />
          <TextField type="number" label="Expenses" value={form.expenses} onChange={(e) => setForm((prev) => ({ ...prev, expenses: Number(e.target.value) }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", background: "#fff", "& fieldset": { borderColor: "#d8c1de" }, "&:hover fieldset": { borderColor: "#cdb4db" }, "&.Mui-focused fieldset": { borderColor: "#a2d2ff" } } }} />
          <TextField select label="Risk Tolerance" value={form.riskTolerance} onChange={(e) => setForm((prev) => ({ ...prev, riskTolerance: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", background: "#fff", "& fieldset": { borderColor: "#d8c1de" }, "&:hover fieldset": { borderColor: "#cdb4db" }, "&.Mui-focused fieldset": { borderColor: "#a2d2ff" } } }}>
            <MenuItem value="conservative">Conservative</MenuItem>
            <MenuItem value="moderate">Moderate</MenuItem>
            <MenuItem value="aggressive">Aggressive</MenuItem>
          </TextField>
          <TextField select label="Theme" value={form.theme} onChange={(e) => setForm((prev) => ({ ...prev, theme: e.target.value }))} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", background: "#fff", "& fieldset": { borderColor: "#d8c1de" }, "&:hover fieldset": { borderColor: "#cdb4db" }, "&.Mui-focused fieldset": { borderColor: "#a2d2ff" } } }}>
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </TextField>
        </div>
        <CuteButton type="submit" disabled={saving} className="mt-4">
          {saving ? "Saving..." : "Save Profile"}
        </CuteButton>
      </motion.form>
    </AppFrame>
  );
}

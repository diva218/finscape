import { useState } from "react";
import { TextField } from "@mui/material";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaHeart } from "react-icons/fa";
import CuteButton from "../components/CuteButton";
import GradientText from "../components/GradientText";

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitting(true);
    try {
      await login(formData);
      showToast("Welcome back to FinScape", "success");
      navigate("/dashboard");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-8 text-slate-950">
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-md rounded-[2rem] border-[3px] border-[#3b2f54] bg-white p-7 shadow-[10px_10px_0px_0px_rgba(124,58,237,0.15)]"
      >
        <p className="inline-block -rotate-1 rounded-full border-[3px] border-[#3b2f54] bg-[#F9A8D4] px-3 py-1 text-xs font-black uppercase tracking-[0.24em] shadow-[4px_4px_0px_0px_rgba(249,168,212,0.4)]">FinScape</p>
        <GradientText as="h1" className="mt-4 font-black text-4xl">Login</GradientText>
        <p className="mt-1 text-sm font-medium text-slate-700">Welcome back to your financial dashboard.</p>
        <div className="mt-5 space-y-4">
          <TextField label="Email" fullWidth type="email" {...register("email", { required: true })} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", background: "#FAF9F6", border: "3px solid #3b2f54", boxShadow: "5px 5px 0px 0px rgba(59,130,246,0.12)", "& fieldset": { borderColor: "#3b2f54" }, "&:hover fieldset": { borderColor: "#7C3AED" }, "&.Mui-focused fieldset": { borderColor: "#7C3AED" } } }} />
          <TextField label="Password" fullWidth type="password" {...register("password", { required: true })} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", background: "#FAF9F6", border: "3px solid #3b2f54", boxShadow: "5px 5px 0px 0px rgba(59,130,246,0.12)", "& fieldset": { borderColor: "#3b2f54" }, "&:hover fieldset": { borderColor: "#7C3AED" }, "&.Mui-focused fieldset": { borderColor: "#7C3AED" } } }} />
        </div>
        <CuteButton type="submit" disabled={submitting} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-[#3b2f54] bg-[#7C3AED] px-5 py-3 font-black text-white shadow-[6px_6px_0px_0px_rgba(124,58,237,0.18)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#8b5cf6]">
          <FaHeart /> {submitting ? "Logging in..." : "Login"}
        </CuteButton>
        <p className="mt-4 text-sm font-medium text-slate-700">
          New to FinScape? <Link to="/signup" className="font-black text-[#7C3AED] underline decoration-[#F9A8D4] decoration-[4px] underline-offset-4">Create account</Link>
        </p>
      </motion.form>
    </div>
  );
}

import { useEffect, useState } from "react";
import AppFrame from "../components/AppFrame";
import ScenarioCanvas from "../components/ScenarioCanvas";
import PersonalityQuiz from "../components/PersonalityQuiz";
import { getPersonality } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function ScenarioBuilderPage() {
  const { user, token } = useAuth();
  const [personality, setPersonality] = useState(null);
  const [loadingPersonality, setLoadingPersonality] = useState(true);

  const hasCompletedQuiz = Boolean(user?.hasCompletedQuiz);

  useEffect(() => {
    if (!user?._id || !token) {
      setLoadingPersonality(false);
      return;
    }

    if (!hasCompletedQuiz) {
      setPersonality(null);
      setLoadingPersonality(false);
      return;
    }

    getPersonality(user._id, token)
      .then((res) => setPersonality(res.personality))
      .catch(() => setPersonality(null))
      .finally(() => setLoadingPersonality(false));
  }, [user?._id, token, hasCompletedQuiz]);

  if (!loadingPersonality && !hasCompletedQuiz) {
    return <PersonalityQuiz onComplete={setPersonality} />;
  }

  if (loadingPersonality) {
    return (
      <AppFrame>
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-slate-600 font-semibold">Loading your financial profile...</p>
        </section>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <div className="space-y-6">
        {personality && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 p-6 shadow-sm border border-indigo-200"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-indigo-700">Financial Profile</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{personality.type} Profile</h2>
              <p className="text-slate-600 mt-2">
                Your scenarios are adapted to your {personality.type.toLowerCase()} approach to financial decisions. 
                Smart suggestions will align with your risk tolerance and savings habits.
              </p>
            </div>
          </motion.section>
        )}

        <ScenarioCanvas personalityType={personality?.type || "Balanced"} />
      </div>
    </AppFrame>
  );
}

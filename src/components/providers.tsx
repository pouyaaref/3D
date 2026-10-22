'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { repository } from '@/lib/repository';
import { defaultPreferences, errorMessage, type Preferences } from '@/lib/types';
const Context = createContext<{
  preferences: Preferences;
  update: (p: Preferences) => Promise<void>;
}>({ preferences: defaultPreferences, update: async () => {} });
export const usePreferences = () => useContext(Context);
export default function Providers({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  useEffect(() => {
    repository
      .preferences()
      .then(setPreferences)
      .catch(() => toast.error('ذخیره‌سازی مرورگر در دسترس نیست. تنظیمات مرورگر را بررسی کنید.'));
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.motion = preferences.reducedMotion ? 'reduced' : 'full';
  }, [preferences]);
  const update = async (p: Preferences) => {
    try {
      await repository.setPreferences(p);
      setPreferences(p);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
  return (
    <Context.Provider value={{ preferences, update }}>
      <MotionConfig reducedMotion={preferences.reducedMotion ? 'always' : 'user'}>
        {children}
        <Toaster position="bottom-center" richColors theme={preferences.theme} dir="rtl" />
      </MotionConfig>
    </Context.Provider>
  );
}

import { supabase } from "@/lib/supabaseClient";

export const authService = {
  signUp: async (email, password) => {
    console.log("AuthService signUp called with:", { email, password });
    
    const signUpData = { 
      email: email, 
      password: password,
    };
    
    console.log("Sending to Supabase:", { ...signUpData, password: "***" });
    
    const { data, error } = await supabase.auth.signUp(signUpData);
    
    console.log("Supabase response:", { data, error });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  signInWithPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

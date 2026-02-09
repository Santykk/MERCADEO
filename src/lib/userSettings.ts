import { supabase } from './supabase';

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'auto';
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
  auto_save: boolean;
  compact_view: boolean;
  timezone: string;
  date_format: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  created_at: string;
  updated_at: string;
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }

  return data;
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_settings')
    .update(settings)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Error updating settings: ${error.message}`);
  }
}

export async function createUserSettings(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .insert({ user_id: userId });

  if (error) {
    throw new Error(`Error creating settings: ${error.message}`);
  }
}

export async function enable2FA(email: string): Promise<void> {
  // Generate a random secret for 2FA
  const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Update user settings with 2FA secret
  await updateUserSettings({
    two_factor_enabled: true,
    two_factor_secret: secret
  });

  // Send email with 2FA setup instructions
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/profile?setup_2fa=true&secret=${secret}`,
  });

  if (error) {
    throw new Error(`Error sending 2FA setup email: ${error.message}`);
  }
}

export async function disable2FA(): Promise<void> {
  await updateUserSettings({
    two_factor_enabled: false,
    two_factor_secret: null
  });
}

export async function deleteUserAccount(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Delete user data from custom tables
  const { error: settingsError } = await supabase
    .from('user_settings')
    .delete()
    .eq('user_id', user.id);

  if (settingsError) {
    console.error('Error deleting user settings:', settingsError);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id);

  if (profileError) {
    console.error('Error deleting user profile:', profileError);
  }

  // Note: Actual user deletion from auth.users requires admin privileges
  // In a production app, this would typically be handled by an admin function
  // For now, we'll sign out the user
  await supabase.auth.signOut();
}
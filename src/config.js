// Öffentliche Konfiguration der App. Hier stehen KEINE Geheimnisse.
// Der Supabase «anon key» ist absichtlich öffentlich: Den Zugriff schützt
// Row Level Security in der Datenbank (siehe supabase/migrations).
// Leer lassen = Fortschritt nur lokal im Browser.
window.KH_CONFIG = {
  supabaseUrl: "https://ecwvjruvoxkkudrjddey.supabase.co",
  supabaseAnonKey: "sb_publishable_4bUr2yaL--92lMe4L61f8g_B6xonULA",
  repoUrl: "https://github.com/GiThomasHub/knowledge-hub",
};

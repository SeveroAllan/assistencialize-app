

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pjpytgcqlpzrcptqveid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcHl0Z2NxbHB6cmNwdHF2ZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDIzMDYsImV4cCI6MjA4MTgxODMwNn0.9Ta4XKDYYMRbOtLRnfjIdzluFg8CvpUUufm_vb9bxxM';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };


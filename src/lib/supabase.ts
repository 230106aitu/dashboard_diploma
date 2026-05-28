import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://ebvdvliykjnxlekurdrw.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjI5NDU1ZWQ4LTllNDAtNDIxZC04YzY2LWVhOGI2NDE1MTkzZiJ9.eyJwcm9qZWN0SWQiOiJlYnZkdmxpeWtqbnhsZWt1cmRydyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc0ODU3MjU2LCJleHAiOjIwOTAyMTcyNTYsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.D_RkdisA2h6bAYstdl-Ld84ljJTlJWI1hBNFgm06o80';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };
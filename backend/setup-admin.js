const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');

async function setupAdminUser() {
  try {
    console.log('🔧 Setting up admin user in Supabase...');
    
    // Hash the password for SethD
    const password = 'VIII';
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'SethD')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', checkError);
      return;
    }
    
    if (existingUser) {
      console.log('✅ Admin user SethD already exists');
      return;
    }
    
    // Insert admin user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username: 'SethD',
          password_hash: passwordHash,
          email: 'seth@example.com',
          role: 'admin',
          is_active: true
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error creating admin user:', insertError);
      return;
    }
    
    console.log('✅ Admin user SethD created successfully with ID:', newUser.id);
    console.log('📝 Username: SethD');
    console.log('🔑 Password: VIII');
    console.log('👑 Role: admin');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupAdminUser();
}

module.exports = setupAdminUser;

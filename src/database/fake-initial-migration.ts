import { DataSource } from 'typeorm';
import dataSource from './database.config';

async function fakeMigration() {
  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');

    // Check if migrations table exists
    const result = await dataSource.query(`
      SELECT * FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'migrations'
    `);

    if (result.length === 0) {
      console.log('❌ Migrations table does not exist. Please run migrations normally.');
      process.exit(1);
    }

    // Insert fake migration record
    await dataSource.query(`
      INSERT INTO migrations (timestamp, name) 
      VALUES (1766994848772, 'InitialSchema1766994848772')
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Successfully marked InitialSchema migration as executed');
    console.log('📝 Note: This migration was not actually run because database already has the schema');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fakeMigration();

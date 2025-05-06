// server/src/data/migrations/migrationFramework.js
const mongoose = require('mongoose');
const logger = require('../config/logger');

// Migration Model
const migrationSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const Migration = mongoose.model('Migration', migrationSchema);

// Migration Framework
class MigrationFramework {
  constructor() {
    this.migrations = [];
  }

  register(version, description, up, down) {
    this.migrations.push({
      version,
      description,
      up,
      down,
    });

    return this;
  }

  async migrate(targetVersion = null) {
    logger.info('Starting migrations...');

    try {
      // Sắp xếp migrations theo version
      this.migrations.sort((a, b) => {
        return a.version.localeCompare(b.version, undefined, { numeric: true });
      });

      // Lấy tất cả migrations đã được áp dụng
      const appliedMigrations = await Migration.find().sort({ version: 1 });
      const lastAppliedVersion = appliedMigrations.length
        ? appliedMigrations[appliedMigrations.length - 1].version
        : null;

      // Nếu không có targetVersion, dùng migration cuối cùng
      targetVersion = targetVersion || this.migrations[this.migrations.length - 1].version;

      if (lastAppliedVersion === targetVersion) {
        logger.info(`Database already at version ${targetVersion}`);
        return;
      }

      // Lấy danh sách các versions đã áp dụng
      const appliedVersions = appliedMigrations.map((m) => m.version);

      // Nếu downgrade
      if (
        lastAppliedVersion &&
        lastAppliedVersion.localeCompare(targetVersion, undefined, { numeric: true }) > 0
      ) {
        logger.info(`Downgrading from ${lastAppliedVersion} to ${targetVersion}`);

        // Lấy các migrations cần rollback
        const migrationsToRollback = this.migrations
          .filter(
            (m) =>
              m.version.localeCompare(targetVersion, undefined, { numeric: true }) > 0 &&
              appliedVersions.includes(m.version)
          )
          .reverse();

        // Áp dụng rollback
        for (const migration of migrationsToRollback) {
          logger.info(`Rolling back migration ${migration.version}: ${migration.description}`);
          await migration.down();
          await Migration.deleteOne({ version: migration.version });
        }

        logger.info(`Successfully downgraded to version ${targetVersion}`);
      }
      // Nếu upgrade
      else {
        logger.info(`Upgrading to version ${targetVersion}`);

        // Lấy các migrations cần áp dụng
        const migrationsToApply = this.migrations.filter(
          (m) =>
            !appliedVersions.includes(m.version) &&
            m.version.localeCompare(targetVersion, undefined, { numeric: true }) <= 0
        );

        // Áp dụng migrations
        for (const migration of migrationsToApply) {
          logger.info(`Applying migration ${migration.version}: ${migration.description}`);
          await migration.up();
          await Migration.create({
            version: migration.version,
            description: migration.description,
          });
        }

        logger.info(`Successfully upgraded to version ${targetVersion}`);
      }
    } catch (error) {
      logger.error('Migration failed', error);
      throw error;
    }
  }

  // Lấy version hiện tại
  async getCurrentVersion() {
    const lastMigration = await Migration.findOne().sort({ version: -1 });
    return lastMigration ? lastMigration.version : null;
  }
}

module.exports = { MigrationFramework, Migration };

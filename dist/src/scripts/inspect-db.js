"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (require.main === module) {
    Promise.resolve().then(() => require('../config/typeorm.config')).then(async (module) => {
        const AppDataSource = module.default;
        try {
            await AppDataSource.initialize();
            console.log('DB Connected');
            const queryRunner = AppDataSource.createQueryRunner();
            console.log('--- ENUMS ---');
            const enums = await queryRunner.query(`SELECT n.nspname as schema, t.typname as type FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typtype = 'e'`);
            console.log(JSON.stringify(enums, null, 2));
            console.log('--- USERS COLUMN ---');
            const cols = await queryRunner.query(`SELECT column_name, udt_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'kycStatus'`);
            console.log(JSON.stringify(cols, null, 2));
            await AppDataSource.destroy();
            process.exit(0);
        }
        catch (error) {
            console.error(error);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=inspect-db.js.map
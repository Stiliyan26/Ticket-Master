import { z } from 'zod';

const envSchema = z.object({
    DB_TYPE: z.enum(['postgres', 'mysql', 'sqlite']).default('postgres'),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().default(5432),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string()
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
    const result = envSchema.safeParse(config);

    if (!result.success) {
        throw new Error(`Config validation error: ${result.error.message}`);
    }

    return result.data;
}
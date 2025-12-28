import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DATABASE_CONFIG_KEY } from './database.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get(DATABASE_CONFIG_KEY);

        return {
          type: dbConfig.type,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          synchronize: true,
          autoLoadEntities: true,
          logging: true, // Enable SQL query logging to see transactions
        };
        // type: configService.get<string>('DB_TYPE') as
        //   | 'postgres'
        //   | 'mysql'
        //   | 'sqlite',
        // host: configService.get<string>('DB_HOST'),
        // port: configService.get<number>('DB_PORT'),
        // username: configService.get<string>('DB_USERNAME'),
        // password: configService.get<string>('DB_PASSWORD'),
        // database: configService.get<string>('DB_NAME'),
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

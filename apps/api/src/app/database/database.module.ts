import { Module } from '@nestjs/common';

@Module({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',            
        host: process.env.DB_HOST || 'localhost',
        port: 5432,                  
        username: 'stiliyan26',      
        password: 'stili2002',                
        database: 'ticket_master',   
        entities: [],
        synchronize: true,           
        autoLoadEntities: true
      }),
    ],
  })
export class DatabaseModule {}

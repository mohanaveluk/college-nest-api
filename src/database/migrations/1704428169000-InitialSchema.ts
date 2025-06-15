//docker-compose up --build
import { MigrationInterface, QueryRunner, Table  } from 'typeorm';

export class initSchema1704428169000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    //password_archive_tbl
    //await queryRunner.query(`CREATE TABLE \`migrations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`timestamp\` bigint NOT NULL, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);	

    await queryRunner.query(`CREATE TABLE \`user_login_history\` (
      \`id\` varchar(36) NOT NULL, 
      \`user_guid\` varchar(255) NOT NULL, 
      \`login_time\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, 
      \`logout_time\` datetime NULL, 
      \`ip_address\` text NULL, 
      \`user_agent\` text NULL, 
      \`device_type\` text NULL, 
      \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
      \`userGuid\` varchar(36) NULL, 
      PRIMARY KEY (\`id\`)
    ) `);
    
    await queryRunner.query(`CREATE TABLE \`refresh_token_tbl\` (
      \`id\` varchar(36) NOT NULL, 
      \`token\` varchar(255) NOT NULL, 
      \`expiresAt\` datetime NOT NULL, 
      \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
      \`isRevoked\` tinyint NOT NULL DEFAULT 0, 
      \`user_guid\` varchar(255) NOT NULL, 
      \`userGuid\` varchar(36) NULL, 
      PRIMARY KEY (\`id\`)
    ) `);
    
    await queryRunner.query(`CREATE TABLE \`password_archive_tbl\` (
      \`id\` int NOT NULL AUTO_INCREMENT, 
      \`password\` varchar(255) NOT NULL, 
      \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
      \`user_guid\` varchar(255) NOT NULL, 
      \`userGuid\` varchar(36) NOT NULL, 
      PRIMARY KEY (\`id\`)
    ) `);
    
    await queryRunner.query(`CREATE TABLE \`users\` (
      \`guid\` varchar(36) NOT NULL, 
      \`first_name\` text NOT NULL, 
      \`last_name\` text NOT NULL, 
      \`email\` varchar(255) NOT NULL, 
      \`password\` text NOT NULL, 
      \`mobile\` text NULL, 
      \`major\` text NULL, 
      \`isEmailVerified\` tinyint NOT NULL DEFAULT 0, 
      \`verificationCode\` text NULL, 
      \`verificationCodeExpiry\` datetime NULL, 
      \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
      \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
      \`is_active\` tinyint NOT NULL DEFAULT 1, 
      \`role_id\` varchar(255) NOT NULL, 
      \`profileImage\` text NULL, 
      \`is_deleted\` tinyint NOT NULL DEFAULT 0, 
      \`last_login\` datetime NULL, 
      \`roleGuid\` varchar(36) NULL, 
      UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), 
      PRIMARY KEY (\`guid\`)
    ) `);
    
    await queryRunner.query(`CREATE TABLE \`otc_tbl\` (
      \`id\` int NOT NULL AUTO_INCREMENT, 
      \`uguid\` varchar(255) NULL, 
      \`mobile\` varchar(255) NOT NULL, 
      \`code\` varchar(255) NOT NULL, 
      \`is_active\` int NOT NULL DEFAULT '1', 
      \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
      \`expiry_datetime\` datetime NOT NULL, 
      PRIMARY KEY (\`id\`)
    ) `);
    
    await queryRunner.query(`CREATE TABLE \`patients\` (
      \`id\` varchar(36) NOT NULL, 
      \`firstName\` varchar(255) NOT NULL, 
      \`lastName\` varchar(255) NOT NULL, 
      \`dateOfBirth\` timestamp NOT NULL, 
      \`gender\` varchar(255) NOT NULL, 
      \`email\` varchar(255) NOT NULL, 
      \`phone\` varchar(255) NOT NULL, 
      \`address\` varchar(255) NOT NULL, 
      \`insuranceProvider\` varchar(255) NULL, 
      \`insuranceNumber\` varchar(255) NULL, 
      \`insuranceExpiryDate\` timestamp NULL, 
      \`medicalHistory\` text NULL, 
      \`allergies\` text NULL, 
      \`chronicConditions\` text NULL, 
      \`currentMedications\` text NULL, 
      \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
      \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
      PRIMARY KEY (\`id\`)
    ) `);
    
    
    await queryRunner.query(`ALTER TABLE 
      \`roles\` CHANGE \`is_active\` \`is_active\` tinyint NOT NULL DEFAULT 1`);
    
    
    await queryRunner.query(`ALTER TABLE 
      \`user_login_history\` 
      ADD 
      CONSTRAINT \`FK_6b4d1bce2e88cf91715a1fdb90b\` FOREIGN KEY (\`userGuid\`) REFERENCES \`users\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    
    
    await queryRunner.query(`ALTER TABLE 
      \`refresh_token_tbl\` 
      ADD 
      CONSTRAINT \`FK_ee3f063667aa77153042488e814\` FOREIGN KEY (\`userGuid\`) REFERENCES \`users\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    
    
    await queryRunner.query(`ALTER TABLE 
      \`password_archive_tbl\` 
      ADD 
      CONSTRAINT \`FK_cb5886188ae13269572224e1134\` FOREIGN KEY (\`userGuid\`) REFERENCES \`users\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    
    
    await queryRunner.query(`ALTER TABLE 
      \`users\` 
      ADD 
      CONSTRAINT \`FK_7fa3739c1597c070e3393fc5d82\` FOREIGN KEY (\`roleGuid\`) REFERENCES \`roles\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    
    
    

    }

  public async down(queryRunner: QueryRunner): Promise<void> {

  }
}
export default initSchema1704428169000;

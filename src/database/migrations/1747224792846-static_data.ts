import { MigrationInterface, QueryRunner, Table  } from 'typeorm';

export class master1747224792846 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {


    // Create table
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS countries (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL
    )`);
    
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS states (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        country_id VARCHAR(36) NOT NULL
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS districts (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        state_id VARCHAR(36) NOT NULL,
        country_id VARCHAR(36) NOT NULL
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(36) PRIMARY KEY,
      code VARCHAR(10) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      updated_at datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    )`);

    // Create table category_sections
    await queryRunner.query(`
        CREATE TABLE category_sections (
          id varchar(36) NOT NULL,
          title varchar(255) NOT NULL,
          description varchar(255) NOT NULL,
          icon varchar(255) NOT NULL,
          expanded tinyint NOT NULL DEFAULT '0',
          PRIMARY KEY (id)
    )`);
            
    // insert countries
    await queryRunner.query(`
          insert into countries (id, code, name) values 
          ('752c1be7-4c36-4d76-89a9-c77ae1774336', 'IN','India'),
          ('cc7fe2b2-e23d-48ad-a0a2-b917a2cd1bf6', 'US','USA');
       `);

       // Insert states
    await queryRunner.query(`
          insert into states (id, code, name, country_id) values 
          ('e353417b-c8a0-4922-be4e-d21caac45c3a', 'AP','Andhra Pradesh', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('ccb8bf65-95b0-49d0-9e34-f40cae21b89e', 'AR','Arunachal Pradesh', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('96213ed9-9fed-401e-b20e-bc5ff55bcfe0', 'AS','Assam', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('6349e7c4-cee6-45fe-b7d2-c855fe227eac', 'BR','Bihar', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('e464d25e-d587-49db-9fa9-f280c7144ca7', 'CT','Chhattisgarh', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('271c62d6-e39e-4993-99c3-1a8928bc23ca', 'GA','Goa', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('65efe778-7f10-45e9-b5b0-c58dee43e12c', 'GJ','Gujarat', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('d8dc0ba7-3a43-4b83-97c1-520263279efa', 'HR','Haryana', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('56e6e157-4f8a-4f59-9256-3118889371c0', 'HP','Himachal Pradesh', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('508313a2-fa88-4181-811e-8999960b8223', 'JK','Jammu and Kashmir', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('511f2ca7-0f6f-4562-a1df-fbfd1258f8ae', 'JH','Jharkhand', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('b814eeec-14ad-45f5-bf56-f99ee0d4420b', 'KA','Karnataka', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('e426b203-811a-4d59-be05-f6434d2908ea', 'KL','Kerala', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('ad9ee1f4-84b4-4349-b8d4-93e65d902c34', 'MP','Madhya Pradesh', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('4bdc893c-7981-413e-b635-e7d0929cb339', 'MH','Maharashtra', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('56f89e2c-4b7d-4091-8675-18b7e574f359', 'MN','Manipur', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('19f308cb-8158-421f-a75d-416873ca4bde', 'ML','Meghalaya', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('7cbb1d7a-c630-4d30-b815-0e3c7263985d', 'MZ','Mizoram', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('17bdcf11-66b0-4cc2-a15d-577c87d5625c', 'NL','Nagaland', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('4cb61d68-f618-4307-949f-66696fdf6ccc', 'OR','Odisha', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('6de6d059-2bb9-4e81-ac04-8602464cfbce', 'PB','Punjab', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('b2a2332f-04d9-49b0-b129-c34caae097bc', 'RJ','Rajasthan', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('443168b6-af85-4bdb-8daa-80a458fc5b76', 'SK','Sikkim', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('68628c43-8739-40d7-ab55-923c9a0d6a7d', 'TN','Tamil Nadu', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('6b74679f-8908-4f21-9328-18ef72e3ce17', 'TG','Telangana', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('fcd85428-4efd-482b-9493-1b928939a6b9', 'TR','Tripura', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('7afc68f6-c46e-4f0b-b642-6400d8f85718', 'UT','Uttarakhand', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('d4fefcc3-a915-46f3-866f-58081f5f2bc6', 'UP','Uttar Pradesh', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('3a064db6-d503-4371-b4da-fc6972b6ebdb', 'WB','West Bengal', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('16615b08-f4d2-4ef1-af6d-ab1029edc981', 'AN','Andaman and Nicobar Islands', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('3c2823f4-595f-439d-b619-0767efbe9daf', 'CH','Chandigarh', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('ce44de03-425f-47d1-af0e-e54c9e1923c5', 'DN','Dadra and Nagar Haveli', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('837399c3-7d10-4bf5-9334-dd83ef376831', 'DD','Daman and Diu', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('59930b2c-f082-4a7f-95a8-92676f5cae77', 'DL','Delhi', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('b4a65d0b-3c58-4013-a4c9-0b53afe4aaa6', 'LD','Lakshadweep', '752c1be7-4c36-4d76-89a9-c77ae1774336'),
          ('f4925d5b-1eed-49e3-955e-6541fb00c378', 'PY','Puducherry', '752c1be7-4c36-4d76-89a9-c77ae1774336');
     `);

     // Insert districts
    await queryRunner.query(`
      insert into districts (id, code,name, state_id, country_id) values 
      ('765638d5-e10a-48eb-8d27-f6d14840aae6', 'Ariyalur','Ariyalur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('33b86357-1153-4e41-9b99-b9685e128df9', 'Chengalpattu','Chengalpattu', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('63cbd559-4eec-4e0e-b0fb-6381dfe6c073', 'Chennai','Chennai', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('fadd0541-32fa-4fb6-928b-1c74a1fd8686', 'Coimbatore','Coimbatore', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('8e63bc03-1c9e-4f11-bfec-37eea3e8d2d1', 'Cuddalore','Cuddalore', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('3a93651e-764f-48f3-8748-25b303c32304', 'Dharmapuri','Dharmapuri', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('69483f23-6312-4c39-826f-a058c83f421a', 'Dindigul','Dindigul', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('e2efd18f-6894-41eb-a8db-08cdb7f21267', 'Erode','Erode', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('3d64dbe1-2a99-4303-9307-175d56e6d9e6', 'Kallakurichi','Kallakurichi', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('a8c5de5c-8c96-4943-9ba3-6792f4a0c35b', 'Kancheepuram','Kancheepuram', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('ed2f933e-4515-4f49-901e-1047a9d1bb9f', 'Kanyakumari','Kanyakumari', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('43e8d60c-0e2c-42f0-95d9-48b6ed30d923', 'Karur','Karur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('50ffbb0b-1865-4bf1-9af1-2af3f37ff5bd', 'Krishnagiri','Krishnagiri', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('892cee4a-7fb9-4377-ad35-2a19cd8e831e', 'Madurai','Madurai', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('b9a7adbb-ccdb-412f-ae95-c0b8705d7444', 'Mayiladuthurai','Mayiladuthurai', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('f13374c1-516b-4538-a8d9-502ee3b7559d', 'Nagapattinam','Nagapattinam', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('c4173481-1e2e-4675-900e-fdab918f8db9', 'Namakkal','Namakkal', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('25314415-663a-4244-9db1-5c2962868664', 'Perambalur','Perambalur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('0fd86ea7-25eb-4f20-b4ad-2fe7dda7e382', 'Pudukkottai','Pudukkottai', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('3f86a37b-6817-4dc5-babd-73c972962aca', 'Ramanathapuram','Ramanathapuram', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('4fa55af9-22fb-4523-b6c5-1629a9db82a5', 'Ranipet','Ranipet', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('62d629ce-cf5a-4c6c-9e52-d7fe59a7b356', 'Salem','Salem', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('e11a7362-b58a-4c5c-b0ed-76a4d0e78e68', 'Sivagangai','Sivagangai', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('16857f49-0ac0-41c8-b5f4-b745f6f98fe3', 'Tenkasi','Tenkasi', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('3db015df-eb65-405f-8488-eea72eb6e087', 'Thanjavur','Thanjavur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('411fa10a-e041-4683-875d-28df1d94b660', 'The Nilgiris','The Nilgiris', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('95f7baf3-92ec-4aae-a8d9-7a791a502c75', 'Theni','Theni', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('76168604-65fc-439f-8e23-05d731626567', 'Thiruvallur','Thiruvallur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('921e9373-3cfa-4f23-89c6-416c273980ac', 'Thiruvarur','Thiruvarur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('a1a0a7bc-5e63-4724-b6f5-606e6f15021d', 'Thoothukudi','Thoothukudi', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('c94e37d8-fe96-4f52-8f19-579dad42775c', 'Tiruchirappalli','Tiruchirappalli', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('6a1bb690-7bc3-47d8-9672-e2ba8682155e', 'Tirunelveli','Tirunelveli', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('9070969c-1cf1-48f9-b11b-e2e1caf2025d', 'Tirupathur','Tirupathur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('13563db6-dce7-4b82-81dd-bac5d416110d', 'Tiruppur','Tiruppur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('2fd5e362-8a2e-4b90-8d5f-b71353a07527', 'Tiruvannamalai','Tiruvannamalai', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('56ded4ab-571b-4a09-914a-e6c00bd31ee5', 'Vellore','Vellore', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('3241e526-54ac-4d28-a7d3-0f1d3d3c30a9', 'Villupuram','Villupuram', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('6c99dc2a-7e9b-49e5-b090-58033936d735', 'Virudhunagar','Virudhunagar', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336');
    `);

    // Insert courses
    await queryRunner.query(`
        insert into courses (id, name, code) values 
        ('7f06298f-40e3-4b5a-bace-bd94e03aff92', 'Aerospace Engineering', 'AEROE'),
        ('08a5467c-ed29-4975-8b32-6561b54b905f', 'Aeronautical Engineering', 'AENEN'),
        ('49f2d335-a5f5-4e23-8a77-f556ade80aed', 'Agricultural Engineering', 'AGRIE'),
        ('fb87ddeb-215f-4a03-8cd9-1b4e1556605d', 'Apparel Technology (SS)', 'APTSS'),
        ('ad49bd17-ee55-491c-9b98-9643e4cc6223', 'Artificial Intelligence And Data Science', 'AIDAS'),
        ('f93042bf-0960-46a7-ad45-13e1149ae874', 'Artificial Intelligence And Data Science (SS)', 'AIDSS'),
        ('6c7afd38-aa23-426e-a8c7-6512191d9272', 'Artificial Intelligence And Machine Learning', 'AIMLE'),
        ('e1bc969b-26e1-4add-8cb9-6dc7ffea0985', 'Automobile Engineering', 'AUTOE'),
        ('a3ce505a-00ee-4a44-a8f9-9f82c96c3b6b', 'Automobile Engineering (SS)', 'AUTSS'),
        ('e81da7ea-695c-4186-a2c7-2d3207787f73', 'Bachelor Of Architecture', 'BARCH'),
        ('cc03cb2d-1409-4b3e-984c-d3ec039e3cd2', 'Bachelor Of Design', 'BDESG'),
        ('aaa332a5-8ebd-4754-b92f-3ccf3e9a8565', 'Bachelor Of Planning', 'BPLAN'),
        ('8d9355c1-b606-4725-a9cf-3556e6acd928', 'Bio Medical Engineering', 'BIOME'),
        ('d9a81d2f-e93f-4c1f-845c-ad7c66d913cc', 'Bio Medical Engineering (SS)', 'BIOSS'),
        ('4e2bfea3-0a22-44d1-994b-94c41ba3191c', 'Bio Technology', 'BIOTE'),
        ('78c211d9-ad95-4a35-94fa-183401d12a9c', 'Bio Technology (SS)', 'BTOSS'),
        ('08e8b02b-7009-40f6-899d-50aa9d973a8a', 'Bio Technology And Bio Chemical Engineering', 'BTBCE'),
        ('dc3dc41c-caba-49c6-9edf-372094e7dd38', 'Ceramic Technology (SS)', 'CERSS'),
        ('b01b5e5b-6c0a-4c16-b16a-5ff35e19cb42', 'Chemical And Electro Chemical Engineering (SS)', 'CECSS'),
        ('b4b7fca9-3971-427d-819f-ea45bc3b7a56', 'Chemical Engineering', 'CHEME'),
        ('405e3d1c-8fc6-428e-9b75-c67b7daaa04e', 'Chemical Engineering (SS)', 'CHESS'),
        ('5994d49a-b500-418a-a075-6d085b416ad6', 'Civil And Structural Engineering', 'CIVSE'),
        ('8cf6ab69-501a-4d01-a00f-1ec6fe9f5091', 'Civil Engineering', 'CIVLE'),
        ('7fb386f6-caa6-4698-80d1-745fef43ecf7', 'Civil Engineering (Environmental Engineering)', 'CIVEE'),
        ('3553f619-2ed8-491d-a27f-c052739a3c35', 'Civil Engineering (SS)', 'CVESS'),
        ('9ff24d5c-22d3-4965-b2d9-fe42ac8dc8e4', 'Civil Engineering (Tamil Medium)', 'CVETM'),
        ('8452521d-0293-4e89-a51d-dfb52b26efc5', 'Computer And Communication Engineering', 'CCENG'),
        ('5521eeb8-0ef7-43ef-859e-106c3118158d', 'Computer Science And Business System (SS)', 'CSBSS'),
        ('23f44d26-8f73-4100-b4f2-c0b1fb069cbe', 'Computer Science And Business System', 'CSBUS'),
        ('efa79f16-3779-4cb6-85ed-fae827425a47', 'Computer Science And Design', 'CSDES'),
        ('979968c9-32bc-4ab3-9aa3-fed5e14349e2', 'Computer Science And Engineering (AI And Machine Learning)', 'CSAIM'),
        ('241acf8c-19ba-4e27-90f9-67bf89b7bd56', 'Computer Science And Engineering (Artificial Intelligence And Machine Learning) (SS)', 'CAISS'),
        ('e9655ba3-2c2f-4de0-8629-2964b53c2164', 'Computer Science And Engineering (Cyber Security)', 'CSCSE'),
        ('c3b5a050-f6a4-4661-91f3-b61bd7963526', 'Computer Science And Engineering (Data Science)', 'CSEDS'),
        ('3cdabf07-e56f-47a0-b832-a1005fd7cead', 'Computer Science And Engineering (IoT And Cyber Security Including Block Chain Technology)', 'CSIBC'),
        ('5c02a24a-b7e4-48a2-a38d-e1a6e1295d5d', 'Computer Science And Engineering (Internet Of Things)', 'CSIoT'),
        ('a93716be-9568-464b-a32b-2818a6f4c846', 'Computer Science And Engineering (SS)', 'CSESS'),
        ('89189747-e285-4f96-a087-d7c79213c582', 'Computer Science And Engineering', 'COSCE'),
        ('a35ec36b-08aa-44fd-a054-e666780b9cf2', 'Computer Science And Engineering (Tamil)', 'CSETM'),
        ('55b4e4ad-a346-42fa-9e77-33f70773ead5', 'Computer Science And Technology', 'CSTEC'),
        ('a8489c42-f83a-4b10-ab55-2908c316c0aa', 'Cyber Security', 'CYBER'),
        ('ae24a50d-b567-40c5-97d8-11aa676258e4', 'Electrical And Computer Engineering', 'ELCOM'),
        ('77006c71-c29c-4886-8a0d-bafb465fb9f2', 'Electrical And Electronics (Sandwich)', 'EESAN'),
        ('ccf6dcdc-153e-4013-8f81-8a11bf83f29b', 'Electrical And Electronics (Sandwich) (SS)', 'EESSS'),
        ('b6ae647d-e484-49af-918b-3276e64161f4', 'Electrical And Electronics Engineering', 'EEELE'),
        ('bd54f558-64ae-4c38-9693-35a586b63de7', 'Electrical And Electronics Engineering (SS)', 'EEESS'),
        ('0cda8573-0d77-4a73-9519-f1dbd6fceff1', 'Electronic Instrumentation And Control Engineering', 'EICE'),
        ('37d64054-61e8-4f2d-a1ee-df5bb0a528ed', 'Electronics And Communication (Advanced Communication Technology)', 'ECACT'),
        ('6aed8ddc-8272-423b-9c2c-4d5eb8cbe568', 'Electronics And Communication Engineering', 'ECENG'),
        ('40dae0ee-f4e2-4d90-a5bc-06ddf422d5e1', 'Electronics And Communication Engineering (SS)', 'ECESS'),
        ('061a6eec-ceeb-4f9f-853e-4f24e0f98220', 'Electronics And Computer Engineering', 'ELCOE'),
        ('bbb206d5-472c-43f0-abb5-434b3adddf77', 'Electronics And Instrumentation Engineering', 'EINSE'),
        ('d567f409-837e-42d8-b04c-b907972513a8', 'Electronics Engineering (VLSI Design And Technology)', 'EVLSI'),
        ('2a60fe9d-8b20-4b1a-8cf5-a2c5a73bbf4b', 'Electronics Engineering (VLSI Design And Technology) (SS)', 'EVSSS'),
        ('b196de89-b7e3-46ba-88cc-aad4f54b7025', 'Environmental Engineering', 'ENVEN'),
        ('ac940514-f70f-4720-93d9-32388f184e47', 'Fashion Technology', 'FASHT'),
        ('c6953ccd-ae09-41df-9f4b-49399601e9c2', 'Fashion Technology (SS)', 'FASSS'),
        ('e22584a2-cd12-42a7-8e76-e474f1239a3b', 'Food Technology', 'FOODT'),
        ('1524868f-7d95-436b-a99d-1e6228f4175d', 'Food Technology (SS)', 'FOTSS'),
        ('798b2a90-d76e-4622-9bd9-e1187e69b289', 'Geo Informatics', 'GEOIN'),
        ('8e28f732-a7b3-4a73-9c3d-b8fcf9c9e9a6', 'Handloom And Textile Technology', 'HTTEX'),
        ('b7a21eb4-15de-42f7-a23b-82c390f415b2', 'Industrial Bio Technology', 'INDBT'),
        ('da8af655-c7f0-4f22-8bc8-50aa2eb8c653', 'Industrial Bio Technology (SS)', 'IBTSS'),
        ('22bf3305-0031-4b9b-a9f0-de8c524c571a', 'Industrial Engineering', 'INDEN'),
        ('1daf4fdf-7b55-477b-a2bc-51439ef3dfca', 'Industrial Engineering And Management', 'IEMGT'),
        ('30e83450-ee93-4398-b093-d616217d61cc', 'Information Technology', 'INFOT'),
        ('67bdd513-39c9-4e80-96b0-40fe2260d518', 'Information Technology (SS)', 'ITSSS'),
        ('d9cefc13-5bb5-4b23-90bd-112fab3fd619', 'Instrumentation And Control Engineering', 'INCON'),
        ('fb3b5e98-8ffd-4862-8059-41a0aa7805c8', 'Instrumentation And Control Engineering (SS)', 'ICESS'),
        ('539e2545-32cd-4875-bd14-7bafa15f2939', 'Interior Design (SS)', 'IDSSS'),
        ('2819fea0-7e95-4d09-b8fc-1d3ec823840e', 'Leather Technology', 'LEATH'),
        ('6fd81689-a28d-4983-a15c-7caf0bdf7492', 'M.Tech. Computer Science And Engineering (Integrated 5 Years)', 'MTCSE'),
        ('343feb51-e79e-42ab-a827-70ffd5e9019f', 'Manufacturing Engineering', 'MANFE'),
        ('52df7398-9430-4742-8cfa-cba1b8ed7026', 'Marine Engineering', 'MARIN'),
        ('d8f7180f-a318-4f97-9674-d65e2bb783e9', 'Master Of Architecture - General', 'MARCG'),
        ('3d7fad9e-8ef7-4971-a661-e62d3358ac2e', 'Master Of Architecture - Landscape', 'MARCL'),
        ('1adddafb-b071-4cf5-bca3-94e95ba1a6f8', 'Master Of Planning', 'MSPLN'),
        ('7f63c5b6-1d34-4599-97e8-836b0c84c878', 'Material Science And Engineering (SS)', 'MSSSS'),
        ('c5913067-5864-4009-84c9-10028c75441b', 'Mechanical And Automation Engineering', 'MECAE'),
        ('6a3bc6e8-4de2-41cc-96a4-1c24fa17b990', 'Mechanical And Mechatronics Engineering (Additive Manufacturing)', 'MEMAM'),
        ('f8bff0bd-37aa-4af1-84d6-cc7324114ff1', 'Mechanical And Smart Manufacturing', 'MESMA'),
        ('5a5ed79d-09ff-4a60-90b0-7ef5d2f896e5', 'Mechanical Engineering', 'MECHE'),
        ('646812fc-59d1-4869-83ee-e7c9cc405aab', 'Mechanical Engineering (Automobile)', 'MECAU'),
        ('2f67d63a-d4bf-4e63-9165-66f8251ca7c4', 'Mechanical Engineering (Manufacturing)', 'MECMF'),
        ('0781feb9-8d1d-4dbd-8b23-17657527c9b9', 'Mechanical Engineering (Sandwich) (SS)', 'MESSS'),
        ('36dfeddb-66ed-45aa-a03b-eea73be2206c', 'Mechanical Engineering (SS)', 'MECSS'),
        ('e3c8a38f-636d-41a8-a176-30e198768332', 'Mechanical Engineering (Tamil Medium)', 'MECTM'),
        ('e1e012cf-2d2e-4e7f-8ae6-a1e5f67bec2e', 'Mechatronics (SS)', 'MEHSS'),
        ('22ce2fd2-0a4a-4b81-a4c8-5b3e6faf068e', 'Mechatronics Engineering', 'MECHT'),
        ('2df17a45-69f5-4dab-84b3-23d9e7271820', 'Medical Electronics', 'MEDEL'),
        ('7facfe5a-0ee8-43cf-95ac-1e8b3f305bb9', 'Metallurgical Engineering', 'METLE'),
        ('11aba17b-a676-43a7-9229-28af6cfceeb8', 'Metallurgical Engineering (SS)', 'METSS'),
        ('3d240b47-3aea-4569-86e4-a4e4953ba4c2', 'Mining Engineering', 'MINEN'),
        ('669917f4-0110-42d0-b534-d91dc2d4e366', 'Petro Chemical Engineering', 'PECHE'),
        ('27fc5e2f-0308-4756-89d8-aa4a4bf3fb6f', 'Petro Chemical Technology', 'PECTE'),
        ('9caf42f9-b954-425a-bec0-a494a6be79ea', 'Petroleum Engineering', 'PETEN'),
        ('9639f10b-d311-44da-bfef-fe6e98c44c14', 'Petroleum Engineering And Technology (SS)', 'PETSS'),
        ('44a8f906-693f-4c0c-8910-b7252c819acb', 'Pharmaceutical Technology', 'PHARM'),
        ('eb085690-75f8-45e8-a079-e2c90b40993a', 'Pharmaceutical Technology (SS)', 'PHTSS'),
        ('81b32c42-d6a0-41e9-b409-8ea80ef11b03', 'Plastic Technology', 'PLAST'),
        ('d8424830-eefe-41bd-84e9-6e894a43dee9', 'Printing & Packing Technology', 'PRPKT'),
        ('cbd91cd3-f70c-4c1e-a209-c5c91585dd9a', 'Production Engineering', 'PRODE'),
        ('2c33245b-5ed2-4db6-960e-72f11c592dde', 'Production Engineering (Sandwich) (SS)', 'PRSSS'),
        ('49af364f-3418-4cf9-affd-99582247a0a5', 'Production Engineering (SS)', 'PROSS'),
        ('615c9eda-d90e-4e1c-b6d2-77ed3aac2cf0', 'Robotics And Automation', 'ROBOT'),
        ('dd7dff6f-e4f9-449c-b88e-8adbdb02bb70', 'Robotics And Automation (SS)', 'RASSS'),
        ('25ab0177-41e9-435d-93ae-b55ccd2cf5d3', 'Rubber And Plastic Technology', 'RUBPT'),
        ('d23f1ef3-c8a9-4f16-9840-7f86a0fbdd90', 'Safety And Fire Engineering', 'SAFIE'),
        ('f7c5358a-667f-489d-9527-8be16cef10bc', 'Textile Chemistry', 'TEXCH'),
        ('c5afd231-0f98-4ea1-84a6-5a7cfc2e43c2', 'Textile Technology', 'TEXTY'),
        ('b3b6fe6b-c917-42f5-a5d3-18fe39f0f9ca', 'Textile Technology (SS)', 'TEXSS')
      `);

      // Insert categoty sections
    await queryRunner.query(`
        insert into category_sections (id, title, description, icon, expanded) values 
        ('d3ca6d6f-1ac0-4fac-add6-22f4058f067e', 'Engineering Colleges', '', 'engineering', 1),
        ('80dd206d-da0d-4491-b182-49328e740076', 'Medical Colleges', '', 'local_hospital', 0),
        ('533840c1-898b-4000-9915-9a602cf89a33', 'Arts & Humanities', '', 'palette', 0),
        ('6da73e49-169c-4414-824c-f09784a090ee', 'Science Colleges', '', 'science', 0),
        ('93c00d5e-6f53-4a30-920b-5585cff33125', 'Law Colleges', '', 'gavel', 0),
        ('c2def0a4-4e46-4c43-b6db-7d42eb2a6e77', 'Business Schools', '', 'business', 0),
        ('69b958bf-4fcb-495c-b461-b3c5a1f2f7c7', 'Pharmacy Colleges', '', 'medication', 0);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

  }
}

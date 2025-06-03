import { timeStamp } from 'console';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

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
      ('ed2f933e-4515-4f49-901e-1047a9d1bb9f', 'Kanniyakumari','Kanniyakumari', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
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
      ('e11a7362-b58a-4c5c-b0ed-76a4d0e78e68', 'Sivaganga','Sivaganga', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('16857f49-0ac0-41c8-b5f4-b745f6f98fe3', 'Tenkasi','Tenkasi', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('3db015df-eb65-405f-8488-eea72eb6e087', 'Thanjavur','Thanjavur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('411fa10a-e041-4683-875d-28df1d94b660', 'TheNilgiris','TheNilgiris', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('95f7baf3-92ec-4aae-a8d9-7a791a502c75', 'Theni','Theni', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('76168604-65fc-439f-8e23-05d731626567', 'Thiruvallur','Thiruvallur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('921e9373-3cfa-4f23-89c6-416c273980ac', 'Thiruvarur','Thiruvarur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('a1a0a7bc-5e63-4724-b6f5-606e6f15021d', 'Thoothukkudi','Thoothukkudi', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('c94e37d8-fe96-4f52-8f19-579dad42775c', 'Tiruchirappalli','Tiruchirappalli', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('6a1bb690-7bc3-47d8-9672-e2ba8682155e', 'Tirunelveli','Tirunelveli', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('9070969c-1cf1-48f9-b11b-e2e1caf2025d', 'Tirupathur','Tirupathur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('13563db6-dce7-4b82-81dd-bac5d416110d', 'Tiruppur','Tiruppur', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('2fd5e362-8a2e-4b90-8d5f-b71353a07527', 'Tiruvannamalai','Tiruvannamalai', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('56ded4ab-571b-4a09-914a-e6c00bd31ee5', 'Vellore','Vellore', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('3241e526-54ac-4d28-a7d3-0f1d3d3c30a9', 'Viluppuram','Viluppuram', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336'),
      ('6c99dc2a-7e9b-49e5-b090-58033936d735', 'Virudhunagar','Virudhunagar', '68628c43-8739-40d7-ab55-923c9a0d6a7d','752c1be7-4c36-4d76-89a9-c77ae1774336');
    `);

    // Insert courses
    await queryRunner.query(`
        insert into courses (id, name, code) values 
          ('36c9afbc-4ade-4329-ae80-fb36948fe6e0', 'Aeronautical Engineering', 'AE'),
          ('db157584-4039-4819-a72b-b10102d99ee7', 'Agricultural Engineering', 'AG'),
          ('50503d04-509a-4ac7-91d1-ecb2f4e79a5c', 'Agricultural and Irrigation Engineering', 'AR'),
          ('b40543df-e673-42da-88d2-f721ad2f2ff7', 'Artificial Intelligence and Data Science', 'AD'),
          ('1bc8df2b-2553-4834-97f8-f8ce341f0fb2', 'Artificial Intelligence and Machine Learning', 'AL'),
          ('3688adb4-cf5e-466f-a38b-9d1653546a6e', 'Aerospace Engineering', 'AO'),
          ('63180a40-34e1-4394-a1b6-d3746f6d0e01', 'Apparel Technology', 'AP'),
          ('9fe53202-06c1-4f40-aedd-9ce988fa8f5b', 'Architecture', 'AT'),
          ('25b21c61-eb21-40a5-b9bc-e5263fe6c9c7', 'Automobile Engineering', 'AU'),
          ('29f7446c-4617-4a50-8a94-c7b89f8fdd81', 'Bio Technology and Bio Chemical Engineering', 'BB'),
          ('576c3ddb-3348-4717-8776-51efd41bd248', 'Bio-Medical Engineering', 'BM'),
          ('cce4d55c-32fd-4b3f-8923-5644bbb52fd8', 'Bio Technology', 'BT'),
          ('4490d9e2-42a0-428d-aed0-73c23cd3879b', 'Ceramic Technology', 'CR'),
          ('142ca66a-e77c-4e2c-8729-c5187338bc0d', 'Civil Engineering', 'CE'),
          ('82bc5025-e8fd-4e3c-a590-1088ee653d99', 'Civil Engineering and Planning', 'CP'),
          ('84c8ef6a-ee8c-4d5c-a988-09d097fa6b24', 'Civil and Structural Engineering', 'CL'),
          ('80857450-791a-49a9-bf7e-8476157ecbba', 'Chemical and Electro Chemical Engineering', 'CC'),
          ('61782ab1-0795-465d-bfad-13e2ff82e447', 'Chemical Engineering', 'CH'),
          ('b72cf979-b30b-4e2b-b2d9-a7a896c1e384', 'Computer and Communication Engineering', 'CO'),
          ('c5fec8be-e152-48de-a75d-8a6d3de79075', 'Computer Science and Business System', 'CB'),
          ('d17f52e6-41ee-4a90-984e-859d9b20a496', 'Computer Science and Design', 'CD'),
          ('8bf7580a-981f-4fd7-8558-0054b58a0e47', 'Computer Science and Engineering', 'CS'),
          ('abb51cbb-3738-4b64-ad68-a237b64a3f51', 'Computer Science and Technology', 'CN'),
          ('d0793c22-1a4b-4a6a-8792-75bb9fa70b8c', 'Computer Technology', 'CT'),
          ('8f77d997-1bca-45b4-bfd4-a130991c4586', 'Cyber Security', 'CY'),
          ('8771bf28-45c4-47ca-8d51-bc07efc0794e', 'Electrical and Electronics Engineering', 'EE'),
          ('0d3f5482-6847-4ec1-818d-f4de03cd5653', 'Electronics and Communication Engineering', 'EC'),
          ('0e096d66-8215-4a7c-8217-5b4e75a59488', 'Electronics and Telecommunication Engg.', 'ET'),
          ('15c9d8d3-09cf-4fe7-8e46-80e6610ca316', 'Electronics and Instrumentation Engineering', 'EI'),
          ('cdac3609-2b2f-4961-8c7d-661669bb3dda', 'Environmental Engineering', 'EG'),
          ('aa41219b-67b1-4dbe-95b0-7eb2a05db2ec', 'Food Technology', 'FS'),
          ('8b0b4ce3-1773-4242-9a3e-3a7009ff4bc9', 'Fashion Technology', 'FT'),
          ('248625ad-386a-45dd-85ac-fea95edd918d', 'Geo-Informatics', 'GI'),
          ('e51882fe-2ed0-4a0d-9222-ffbdca2a0231', 'Handloom and Textile Technology', 'HT'),
          ('6326fe90-e47c-4a94-9c4f-ab51803fe79e', 'Industrial Bio-Technology', 'IB'),
          ('4112b867-ee06-4716-9cd2-1b3c838a41f0', 'Instrumentation and Control Engineering', 'IY'),
          ('39df27ab-329b-44fd-a87c-92239ef0c5ca', 'Industrial Engineering', 'IE'),
          ('4647bd88-d9d9-4c3f-9203-36c8d25f2ec2', 'Information Technology', 'IT'),
          ('ed26519e-cdd8-49de-ae55-cf56e28274e2', 'Information Science and Engineering', 'IS'),
          ('2ab90db8-2693-4fd0-aa33-cfcfef2f953b', 'Industrial Engineering and Management', 'IM'),
          ('8c9b0802-513a-4422-8a87-a9ce2aec338e', 'Instrumentation and Control Engineering', 'IC'),
          ('ca5d4fed-439f-4515-a9b2-2fc1071d249a', 'Leather Technology', 'LE'),
          ('bbf2e32c-4c30-4e52-802a-8e5a9c3e9034', 'Material Science and Engineering', 'MA'),
          ('f9fac36f-f07d-483f-a096-adef7e309ce5', 'Mechatronics', 'MH'),
          ('cde7e167-e244-4411-9917-1125e051a7a9', 'Mechatronics Engineering', 'MZ'),
          ('6dd97e7b-6927-4918-848f-7744f042bcbf', 'Medical Electronics Engg.', 'ML'),
          ('d083f22b-4902-4a19-8db3-107cb52f1acb', 'Mechanical Engineering', 'ME'),
          ('68010b42-d8ef-4b8d-b1f9-dd3f8fa89b26', 'Mechanical and Mechatronics Engineering ', 'MM'),
          ('1765a8a9-c4ac-4807-b6fe-a02579943bde', 'Mining Engineering', 'MI'),
          ('62ad43f3-45c0-4c6b-974b-39a34282ed08', 'Manufacturing Engineering', 'MN'),
          ('dcfa2082-462b-4f8f-86ee-6891f31a8e34', 'Marine Engineering', 'MR'),
          ('8a352a69-d43c-4032-ba6b-58ce361076bd', 'Metallurgical Engineering', 'MT'),
          ('a4bf7854-d201-4641-8bae-edb5b3c7f9f7', 'Mechanical and Automation Engineering', 'MU'),
          ('3b175c33-d3c9-4e7b-b243-836ae8bd1b07', 'M.Tech Computer Science and Engineering', 'MS'),
          ('93940ef4-ca7e-4583-a584-5a098639a783', 'Nano Science and Technology', 'NS'),
          ('1584e81c-2b66-445d-bc5b-60e43590394a', 'Plastic Technology', 'PL'),
          ('350f6993-f2ff-4e54-aa5c-618919e85320', 'Petro Chemical Technology', 'PC'),
          ('0dbd0bb8-8f5d-4d00-95b3-1915c461420a', 'Petrochemical Engineering', 'PH'),
          ('003214bd-b981-4462-8afb-548325cbec1a', 'Petroleum Engineering', 'PE'),
          ('e7d5d869-de39-434d-a3c0-2498c5f2f893', 'Petroleum Engineering and Technology', 'PA'),
          ('d47289ee-1abd-4990-a1bb-4848589f5e78', 'Pharmaceutical Technology', 'PM'),
          ('18f0aba0-5f62-4038-a63c-dad12565e0a8', 'Polymer Technology', 'PY'),
          ('0a0494ba-704c-4cc2-a09e-8855c3c08c36', 'Production Engineering', 'PR'),
          ('67767d37-0686-49f2-8093-53ad4a561ab9', 'Printing Technology', 'PT'),
          ('a317527e-90ea-4794-a881-52af364f3b12', 'Robotics and Automation', 'RA'),
          ('50e5e0d7-2930-4fe6-aa0d-fde5bd7f3235', 'Rubber and Plastic Technology', 'RP'),
          ('08fa4858-e76c-449b-8512-6ba3c8d2c46a', 'Safety and Fire Engineering', 'SE'),
          ('f503262e-e5e9-4e53-993d-07846f1e2795', 'Textile Chemistry', 'TE'),
          ('66d681d3-dc93-4a4c-8004-7e0862e101f8', 'Textile Technology', 'TX');

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

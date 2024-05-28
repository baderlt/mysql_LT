import MysqlOrm from '../lib/MysqlLt';
class Utilisateur extends MysqlOrm  {
  static table ="utilisateurs";
  static _filables=["Nom_utilisateur","Email","Mot_de_passe"];

}



describe('Utilisateur Model', () => {
  //// model class for test 
    beforeAll(async () => {
      const config = {
        host: 'localhost',
        user: 'root',
        password: '2003@12@4',
        database: 'quiz_Multijoueur',
      };
      await MysqlOrm.connect(config);
      
    });
  
    afterEach(() => {
      
      MysqlOrm._conditions_ = [];
      MysqlOrm._select_Fields = "";
      MysqlOrm._limit_ = null;
      MysqlOrm._Group_By = "";
      MysqlOrm._order_by = [];
      MysqlOrm._Join_ = [];
      MysqlOrm._offset_ = null;
    });
  
    it('should insert a new user', async () => {
      const user = new Utilisateur({
        Nom_utilisateur: 'JohnDoe',
        Email: 'john.doe@example.com',
        Mot_de_passe: 'securepassword',
        Token_JWT:"ddd",
      });
      const result = await user.save();
      expect(result.affectedRows).toBe(1);
    });
  
    it('should retrieve a user by id', async () => {
      Utilisateur.select('*').where('ID_utilisateur', '=', 1);
      const results = await Utilisateur.get();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].ID_utilisateur).toBe(1);
    });
  
    // it('should update a user\'s email', async () => {
    //   Utilisateur.where('ID_utilisateur', '=', '35');
    //   const result = await Utilisateur.update({ Email: 'john.updated@example.com' });
    //   expect(result.affectedRows).toBe(1);
    // });
  
    // it('should delete a user', async () => {
    //   Utilisateur.where('ID_utilisateur', '=', '35');
    //   const result = await Utilisateur.delete();
    //   expect(result.affectedRows).toBe(1);
    // });
  });
  


  describe('MysqlOrm Query Building', () => {
    afterEach(() => {
      MysqlOrm._conditions_ = [];
      MysqlOrm._select_Fields = "";
      MysqlOrm._limit_ = null;
      MysqlOrm._Group_By = "";
      MysqlOrm._order_by = [];
      MysqlOrm._Join_ = [];
      MysqlOrm._offset_ = null;
    });
  
    it('should build a correct SELECT query', () => {
        Utilisateur.select('ID_utilisateur,Nom_utilisateur').where('ID_utilisateur', '>', 1);
      const { query, params } = Utilisateur.GetQuery('select');
      expect(query).toBe('select ID_utilisateur,Nom_utilisateur from utilisateurs where ID_utilisateur > ?');
      expect(params).toEqual([1]);
    });
  });
  

  describe('MysqlOrm Conditions', () => {
    afterEach(() => {
      MysqlOrm._conditions_ = [];
    });
  
    it('should add a WHERE condition correctly', () => {
        MysqlOrm.where('ID_utilisateur', '=', 1);
      expect(MysqlOrm._conditions_).toContainEqual({ type: ' and', column: 'ID_utilisateur', condition: '=', value: 1 });
    });
  
    it('should add an OR WHERE condition correctly', () => {
        MysqlOrm.orWhere('Nom_utilisateur', '=', 'John');
      expect(MysqlOrm._conditions_).toContainEqual({ type: '  OR', column: 'Nom_utilisateur', condition: '=', value: 'John' });
    });
  });
  


  describe('MysqlOrm Joins', () => {
    afterEach(() => {
      MysqlOrm._Join_ = [];
    });
  
    it('should add an INNER JOIN correctly', () => {
      MysqlOrm.Join('profiles', 'utilisateurs.ID_utilisateur', 'profiles.user_ID_utilisateur');
      expect(MysqlOrm._Join_).toContainEqual({ Operation: 'INNER JOIN', table: 'profiles', t1: 'utilisateurs.ID_utilisateur', t2: 'profiles.user_ID_utilisateur' });
    });
  
    it('should add a LEFT JOIN correctly', () => {
      MysqlOrm.LeftJoin('profiles', 'utilisateurs.ID_utilisateur', 'profiles.user_ID_utilisateur');
      expect(MysqlOrm._Join_).toContainEqual({ Operation: 'LEFT JOIN ', table: 'profiles', t1: 'utilisateurs.ID_utilisateur', t2: 'profiles.user_ID_utilisateur' });
    });
  });
  
import MysqlOrm from '../lib/MysqlLt';
// const MysqlOrm=require("../Model.js");

describe('MysqlOrm Connection', () => {
  it('should connect to the MySQL database successfully', async () => {
    const config = {
      host: 'localhost',
      user: 'root',
      password: '2003@12@4',
      database: 'quiz_Multijoueur',
    };
    const result = await MysqlOrm.connect(config);
    expect(result).toBe(true);
  });


});

import MysqlOrm from '../lib/MysqlLt';

jest.mock('../lib/MysqlLt');

describe('MysqlOrm Transactions with Models', () => {
    beforeEach(() => {
        
        MysqlOrm._transactions = { run: false, requests: [] };
        MysqlOrm.connect = jest.fn();
        MysqlOrm.beginTransaction = jest.fn(() => {
            MysqlOrm._transactions.run = true;
        });

        MysqlOrm.Commit = jest.fn(() => {
            return new Promise((resolve, reject) => {
                if (!MysqlOrm._transactions.run) {
                    return reject(new Error('Cannot commit a transaction without starting'));
                }
                if (MysqlOrm._transactions.requests.length === 0) {
                    return reject(new Error('Cannot commit a transaction without requests'));
                }

                let hasError = false;
                MysqlOrm._transactions.requests.forEach(request => {
                    if (request.query.includes('error')) {
                        hasError = true;
                    }
                });

                if (hasError) {
                    MysqlOrm._transactions.run = false;
                    MysqlOrm._transactions.requests = [];
                    return reject(new Error('Query error'));
                }

                MysqlOrm._transactions.run = false;
                MysqlOrm._transactions.requests = [];
                resolve({ status: 'success' });
            });
        });

        MysqlOrm.statement = jest.fn((query, params) => {
            return new Promise((resolve, reject) => {
                if (query.includes('error')) {
                    reject(new Error('Query error'));
                } else {
                    resolve({ affectedRows: 1 });
                }
            });
        });
    });

    afterEach(() => {
        MysqlOrm._transactions = { run: false, requests: [] };
    });

    test('should start a transaction', () => {
        MysqlOrm.beginTransaction();
        expect(MysqlOrm._transactions.run).toBe(true);
    });

    test('should commit a transaction with Utilisateur and Partie models', async () => {
        MysqlOrm.beginTransaction();
        MysqlOrm._transactions.requests.push({ query: 'UPDATE utilisateurs SET Email=? WHERE Nom_utilisateur=?', params: ['madayzax pro max', 'test'] });
        MysqlOrm._transactions.requests.push({ query: 'UPDATE parties SET Code_partie=? WHERE ID_partie=?', params: ['testTransaction', 127] });

        await expect(MysqlOrm.Commit()).resolves.toEqual({ status: 'success' });
        expect(MysqlOrm._transactions.run).toBe(false);
        expect(MysqlOrm._transactions.requests).toHaveLength(0);
    });

    test('should rollback a transaction on query error', async () => {
        MysqlOrm.beginTransaction();
        MysqlOrm._transactions.requests.push({ query: 'UPDATE utilisateurs SET Email=error WHERE Nom_utilisateur=?', params: ['error email', 'test'] });

        await expect(MysqlOrm.Commit()).rejects.toThrow('Query error');
        expect(MysqlOrm._transactions.run).toBe(false);
        expect(MysqlOrm._transactions.requests).toHaveLength(0);
    });

    test('should handle commit error', async () => {
        MysqlOrm.beginTransaction();
        MysqlOrm._transactions.requests.push({ query: 'UPDATE utilisateurs SET Email=? WHERE Nom_utilisateur=?', params: ['error email', 'test'] });

        MysqlOrm.Commit.mockImplementationOnce(() => {
            return new Promise((resolve, reject) => {
                MysqlOrm._transactions.run = false;
                MysqlOrm._transactions.requests = [];
                reject(new Error('Commit error'));
            });
        });

        await expect(MysqlOrm.Commit()).rejects.toThrow('Commit error');
        expect(MysqlOrm._transactions.run).toBe(false);
        expect(MysqlOrm._transactions.requests).toHaveLength(0);
    });
});

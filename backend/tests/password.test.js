require('dotenv').config();

const { hashPassword, comparePassword } = require('../src/utils/password');

describe('password utils', () => {
  test('hashPassword는 원문과 다른 bcrypt 해시($2로 시작)를 반환한다', async () => {
    const hash = await hashPassword('plain123');

    expect(hash).not.toBe('plain123');
    expect(hash.startsWith('$2')).toBe(true);
  });

  test('comparePassword는 올바른 평문에 대해 true를 반환한다', async () => {
    const hash = await hashPassword('plain123');

    await expect(comparePassword('plain123', hash)).resolves.toBe(true);
  });

  test('comparePassword는 잘못된 평문에 대해 false를 반환한다', async () => {
    const hash = await hashPassword('plain123');

    await expect(comparePassword('wrongpass', hash)).resolves.toBe(false);
  });

  test('같은 평문을 두 번 해시하면 salt로 인해 서로 다른 해시가 생성되지만 둘 다 원문과 일치한다', async () => {
    const hash1 = await hashPassword('plain123');
    const hash2 = await hashPassword('plain123');

    expect(hash1).not.toBe(hash2);
    await expect(comparePassword('plain123', hash1)).resolves.toBe(true);
    await expect(comparePassword('plain123', hash2)).resolves.toBe(true);
  });
});

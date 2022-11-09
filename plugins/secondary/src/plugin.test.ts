import { secondaryPlugin } from './plugin';

describe('secondary', () => {
  it('should export plugin', () => {
    expect(secondaryPlugin).toBeDefined();
  });
});

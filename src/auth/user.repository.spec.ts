import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';

const mockCredentialsDto = { username: 'test', password: 'test' };

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('signup', () => {
    let save;
    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });
    it('should return a user', async () => {
      save.mockReturnValue(undefined);
    });
  });
});

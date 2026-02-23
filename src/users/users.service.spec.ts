import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userData = { email: 'test@example.com', password: 'hashedContent' };
      const userInstance = { id: 'uuid-1', ...userData };
      
      mockUsersRepository.create.mockReturnValue(userInstance);
      mockUsersRepository.save.mockResolvedValue(userInstance);

      const result = await service.create(userData);

      expect(result).toEqual(userInstance);
      expect(repository.create).toHaveBeenCalledWith(userData);
      expect(repository.save).toHaveBeenCalledWith(userInstance);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const userInstance = { id: 'uuid-1', email };
      
      mockUsersRepository.findOne.mockResolvedValue(userInstance);

      const result = await service.findByEmail(email);

      expect(result).toEqual(userInstance);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const id = 'uuid-1';
      const userInstance = { id, email: 'test@example.com' };
      
      mockUsersRepository.findOne.mockResolvedValue(userInstance);

      const result = await service.findById(id);

      expect(result).toEqual(userInstance);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
    });
  });
});


// application/orchestrator/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserService } from '../use-cases/create-user.service';
import { UpdateUserService } from '../use-cases/update-user.service';
import { DeleteUserService } from '../use-cases/delete-user.service';
import { FindUsersService } from '../use-cases/find-users.service';
import { ChangePasswordService } from '../use-cases/change-password.service';
import { ResetPasswordService } from '../use-cases/reset-password.service';

describe('UsersService', () => {
    let service: UsersService;
    let createUserService: jest.Mocked<CreateUserService>;
    let updateUserService: jest.Mocked<UpdateUserService>;
    let deleteUserService: jest.Mocked<DeleteUserService>;
    let findUsersService: jest.Mocked<FindUsersService>;
    let changePasswordService: jest.Mocked<ChangePasswordService>;
    let resetPasswordService: jest.Mocked<ResetPasswordService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: CreateUserService,
                    useValue: { execute: jest.fn() }
                },
                {
                    provide: UpdateUserService,
                    useValue: { execute: jest.fn() }
                },
                {
                    provide: DeleteUserService,
                    useValue: { execute: jest.fn() }
                },
                {
                    provide: FindUsersService,
                    useValue: {
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        findByUsername: jest.fn()
                    }
                },
                {
                    provide: ChangePasswordService,
                    useValue: { execute: jest.fn() }
                },
                {
                    provide: ResetPasswordService,
                    useValue: {
                        execute: jest.fn(),
                        generateTemporaryPassword: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<UsersService>(UsersService);
        createUserService = module.get(CreateUserService);
        updateUserService = module.get(UpdateUserService);
        deleteUserService = module.get(DeleteUserService);
        findUsersService = module.get(FindUsersService);
        changePasswordService = module.get(ChangePasswordService);
        resetPasswordService = module.get(ResetPasswordService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createUserDto = {
                username: 'testuser',
                password: 'Password123!',
                nama_lengkap: 'Test User',
                roles: [1]
            };

            const expectedResult = {
                id: 1,
                username: 'testuser',
                nama_lengkap: 'Test User',
                roles: [{ id: 1, name: 'staf', description: 'Staf' }],
                created_at: new Date(),
                updated_at: new Date()
            };

            createUserService.execute.mockResolvedValue(expectedResult);

            const result = await service.create(createUserDto);

            expect(result).toEqual(expectedResult);
            expect(createUserService.execute).toHaveBeenCalledWith(createUserDto);
        });
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const query = {};
            const expectedResult = [
                {
                    id: 1,
                    username: 'user1',
                    nama_lengkap: 'User One',
                    roles: [],
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ];

            findUsersService.findAll.mockResolvedValue(expectedResult);

            const result = await service.findAll(query);

            expect(result).toEqual(expectedResult);
            expect(findUsersService.findAll).toHaveBeenCalledWith(query);
        });
    });

    describe('changePassword', () => {
        it('should change user password', async () => {
            const userId = 1;
            const oldPassword = 'OldPass123!';
            const newPassword = 'NewPass123!';

            const expectedResult = {
                message: 'Password berhasil diubah',
                timestamp: new Date().toISOString(),
                user: { id: userId, username: 'testuser' }
            };

            changePasswordService.execute.mockResolvedValue(expectedResult);

            const result = await service.changePassword(userId, oldPassword, newPassword);

            expect(result).toEqual(expectedResult);
            expect(changePasswordService.execute).toHaveBeenCalledWith(
                userId,
                oldPassword,
                newPassword
            );
        });
    });
});
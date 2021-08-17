import { Test } from '@nestjs/testing';
import { TaskStatus } from './task-status.enum';
import { getTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';
import { NotFoundException } from '@nestjs/common';

const mockUser = { id: 7, username: 'test' };
const mockCreateTask = {
  title: 'test',
  description: 'test',
  status: TaskStatus.IN_PROGRESS,
};
const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  updateTaskStatus: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();
    tasksService = module.get<TasksService>(TasksService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  describe('getAll', () => {
    it('should return all tasks from the repository', async () => {
      taskRepository.getTasks.mockReturnValue('test');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: getTaskFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'test search',
      };
      //call tasksService.getTasks
      const result = await tasksService.getTasks(filters, mockUser);
      //Expect to call taskRepository.getTasks
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('test');
    });
  });

  describe('getTaskById', () => {
    //call taskRepository.findOne() and successfully retrieves  and returns the task
    it('should return the task from the repository', async () => {
      const mockTask = {
        title: 'test title',
        description: 'test description',
      };

      taskRepository.findOne.mockReturnValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id },
      });
    });
    it('throws an error with rask is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('should create a task and return the task', async () => {
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      taskRepository.createTask.mockResolvedValue(mockCreateTask, mockUser);
      const result = await tasksService.createTask(mockCreateTask, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        mockCreateTask,
        mockUser,
      );
      expect(result).toEqual(mockCreateTask);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update a task and return the task', async () => {
      const save = jest.fn().mockResolvedValue(true);
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.DONE,
        save,
      });
      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and return the task', async () => {
      taskRepository.delete.mockResolvedValue({
        affected: 1,
      });
      expect(taskRepository.delete).not.toHaveBeenCalled();

      await tasksService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('should throw an error with rask is not found', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TeacherRoomManager from '../pages/teacher/TeacherRoomManager';
import { MemoryRouter } from 'react-router-dom';

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
  Users: () => <span data-testid="icon-users" />,
  Plus: () => <span data-testid="icon-plus" />,
  Play: () => <span data-testid="icon-play" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  Settings: () => <span data-testid="icon-settings" />,
  X: () => <span data-testid="icon-x" />,
  Search: () => <span data-testid="icon-search" />,
  Globe: () => <span data-testid="icon-globe" />,
  Lock: () => <span data-testid="icon-lock" />,
  BarChart3: () => <span data-testid="icon-barchart" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Edit2: () => <span data-testid="icon-edit" />,
  Clock: () => <span data-testid="icon-clock" />
}));

// Mock the API hooks
vi.mock('../redux/api/roomApiSlice', () => ({
  useGetRoomsQuery: vi.fn(),
  useCreateRoomMutation: vi.fn(),
  useUpdateRoomMutation: vi.fn(),
  useDeleteRoomMutation: vi.fn(),
}));

vi.mock('../redux/api/quizApiSlice', () => ({
  useGetPublishedQuizzesQuery: vi.fn(),
}));

// Import the mocked hooks so we can configure them in tests
import {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from '../redux/api/roomApiSlice';
import { useGetPublishedQuizzesQuery } from '../redux/api/quizApiSlice';

describe('TeacherRoomManager Component', () => {
  const mockUser = { _id: 'teacher1', name: 'Test Teacher' };
  
  const mockCreateRoom = vi.fn();
  const mockUpdateRoom = vi.fn();
  const mockDeleteRoom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    useCreateRoomMutation.mockReturnValue([mockCreateRoom]);
    useUpdateRoomMutation.mockReturnValue([mockUpdateRoom]);
    useDeleteRoomMutation.mockReturnValue([mockDeleteRoom]);
    
    useGetRoomsQuery.mockReturnValue({
      data: [
        { _id: 'room1', name: 'Math 101', status: 'waiting', quizzes: [] }
      ],
      isLoading: false
    });
    
    useGetPublishedQuizzesQuery.mockReturnValue({
      data: [
        { _id: 'quiz1', name: 'Math Quiz 1' }
      ],
      isLoading: false
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <TeacherRoomManager user={mockUser} />
      </MemoryRouter>
    );
  };

  it('renders the room list correctly', () => {
    renderComponent();
    expect(screen.getByText('Math 101')).toBeInTheDocument();
    expect(screen.getByText('Create Session')).toBeInTheDocument();
  });

  it('opens the "Create Room" modal when button is clicked', () => {
    renderComponent();
    const createBtn = screen.getByText('Create Session');
    fireEvent.click(createBtn);
    
    // The modal should appear
    expect(screen.getByText('Create New Session')).toBeInTheDocument();
    expect(screen.getByText('Session Name')).toBeInTheDocument();
  });

  it('submits the form and calls createRoom mutation', async () => {
    mockCreateRoom.mockReturnValue({ unwrap: () => Promise.resolve({ _id: 'new_room' }) });
    
    renderComponent();
    fireEvent.click(screen.getByText('Create Session'));
    
    // Fill the form
    const input = screen.getByPlaceholderText('e.g. Fall Midterm Review');
    fireEvent.change(input, { target: { value: 'New Test Room' } });
    
    // Select a quiz (assumes quiz name is rendered in a label or div we can click)
    const quizElement = screen.getByText('Math Quiz 1');
    fireEvent.click(quizElement);
    
    // Submit
    const submitBtn = screen.getByText('Create & Open Lobby');
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(mockCreateRoom).toHaveBeenCalledWith({
        name: 'New Test Room',
        quizzes: [{ quiz_id: 'quiz1', status: 'waiting' }],
        settings: {
          is_public: false,
          show_leaderboard: true
        },
        teacher_id: 'teacher1',
        status: 'waiting',
        scheduled_for: null
      });
    });
  });
});

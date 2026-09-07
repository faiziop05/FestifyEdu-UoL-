import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActiveRoomLobby from '../pages/teacher/ActiveRoomLobby';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock child components that are complex and not the focus of this test
vi.mock('../components/Header', () => ({
  default: () => <div data-testid="mock-header" />
}));
vi.mock('../components/ActiveRoomLobby/RoomLobbySidebar', () => ({
  default: ({ handleStatusChange }) => (
    <div data-testid="mock-sidebar">
      <button onClick={() => handleStatusChange('ended')}>End Session</button>
    </div>
  )
}));
vi.mock('../components/ActiveRoomLobby/RoomLobbyQuizzes', () => ({
  default: ({ openQuizModal, handleSetQuizStatus }) => (
    <div data-testid="mock-quizzes">
      <button onClick={openQuizModal}>Add Quiz</button>
      <button onClick={() => handleSetQuizStatus('quiz1', 'active')}>Start Quiz 1</button>
    </div>
  )
}));
vi.mock('../components/ActiveRoomLobby/RoomLobbyParticipants', () => ({
  default: () => <div data-testid="mock-participants" />
}));
vi.mock('../components/ActiveRoomLobby/AddQuizModal', () => ({
  default: ({ isOpen, onClose }) => isOpen ? (
    <div data-testid="mock-add-quiz-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
}));
vi.mock('../components/ActiveRoomLobby/QuizResponsesModal', () => ({
  default: () => null
}));

// Mock API hooks
vi.mock('../redux/api/roomApiSlice', () => ({
  useGetRoomByIdQuery: vi.fn(),
  useUpdateRoomMutation: vi.fn(() => [vi.fn()]),
  useDeleteRoomMutation: vi.fn(() => [vi.fn()]),
}));
vi.mock('../redux/api/quizApiSlice', () => ({
  useGetPublishedQuizzesQuery: vi.fn(),
}));

// Mock Socket hook
const mockEmitEvent = vi.fn();
const mockListenTo = vi.fn(() => vi.fn()); // returns an unbind function

vi.mock('../hooks/useRoomSocket', () => ({
  default: vi.fn(() => ({
    emitEvent: mockEmitEvent,
    listenTo: mockListenTo,
    isConnected: true
  }))
}));

import { useGetRoomByIdQuery, useUpdateRoomMutation } from '../redux/api/roomApiSlice';
import { useGetPublishedQuizzesQuery } from '../redux/api/quizApiSlice';

describe('ActiveRoomLobby Component', () => {
  const mockUpdateRoom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useUpdateRoomMutation.mockReturnValue([mockUpdateRoom]);
    
    useGetRoomByIdQuery.mockReturnValue({
      data: {
        _id: 'room1',
        room_code: '123456',
        name: 'Live Session',
        status: 'active',
        quizzes: [{ quiz_id: { _id: 'quiz1', name: 'Q1' }, status: 'waiting' }]
      },
      isLoading: false,
      isError: false
    });
    
    useGetPublishedQuizzesQuery.mockReturnValue({
      data: [],
      isLoading: false
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/teacher/room/room1']}>
        <Routes>
          <Route path="/teacher/room/:roomId" element={<ActiveRoomLobby />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders the lobby layout successfully', () => {
    renderComponent();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-quizzes')).toBeInTheDocument();
    expect(screen.getByTestId('mock-participants')).toBeInTheDocument();
  });

  it('opens the add quiz modal', () => {
    renderComponent();
    expect(screen.queryByTestId('mock-add-quiz-modal')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Add Quiz'));
    expect(screen.getByTestId('mock-add-quiz-modal')).toBeInTheDocument();
  });

  it('calls updateRoom and emits end_session socket event when ending session', async () => {
    mockUpdateRoom.mockReturnValue({ unwrap: () => Promise.resolve() });
    
    renderComponent();
    fireEvent.click(screen.getByText('End Session'));
    
    await waitFor(() => {
      expect(mockUpdateRoom).toHaveBeenCalledWith({ id: 'room1', status: 'ended' });
    });
    
    await waitFor(() => {
      expect(mockEmitEvent).toHaveBeenCalledWith('end_session', { room_code: '123456' });
    });
  });

  it('calls updateRoom to start a quiz', async () => {
    mockUpdateRoom.mockReturnValue({ unwrap: () => Promise.resolve() });
    
    renderComponent();
    fireEvent.click(screen.getByText('Start Quiz 1'));
    
    await waitFor(() => {
      expect(mockUpdateRoom).toHaveBeenCalled();
      const callArgs = mockUpdateRoom.mock.calls[0][0];
      expect(callArgs.id).toBe('room1');
      expect(callArgs.quizzes[0].status).toBe('active');
    });
  });
});

/**
 * WebSocket service for real-time updates
 */

import type { Server as SocketIOServer } from 'socket.io';

export function setupWebSocket(io: SocketIOServer): void {
  io.on('connection', (socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);

    // Join test drive room
    socket.on('join:testdrive', (testDriveId: string) => {
      socket.join(`testdrive:${testDriveId}`);
      console.log(`Client ${socket.id} joined testdrive:${testDriveId}`);
    });

    // Leave test drive room
    socket.on('leave:testdrive', (testDriveId: string) => {
      socket.leave(`testdrive:${testDriveId}`);
      console.log(`Client ${socket.id} left testdrive:${testDriveId}`);
    });

    socket.on('disconnect', () => {
      console.log(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  console.log('WebSocket handlers registered');
}

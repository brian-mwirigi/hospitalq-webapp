export function initSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join:department', ({ deptId }) => {
      if (deptId) {
        socket.join(String(deptId));
      }
    });

    socket.on('leave:department', ({ deptId }) => {
      if (deptId) {
        socket.leave(String(deptId));
      }
    });
  });
}

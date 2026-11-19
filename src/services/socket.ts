// Sockets disabled per requirement - Manual refresh REST mode
export const getSocket = () => ({
  on: () => {},
  off: () => {},
  emit: () => {}
});

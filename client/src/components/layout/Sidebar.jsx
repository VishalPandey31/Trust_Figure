import { useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";

function Sidebar() {
  const { users, getUsers, selectedUser, setSelectedUser, onlineUsers, isUsersLoading } = useChatStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div className="p-3">

      <h2 className="mb-3 font-bold">Users</h2>

      {isUsersLoading ? (
        <div className="text-gray-400 text-sm">Loading users...</div>
      ) : (
        users.map((user) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`flex items-center justify-between p-2 hover:bg-white/5 rounded cursor-pointer ${selectedUser?._id === user._id ? 'bg-white/10' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs">{user.fullName.charAt(0)}</span>
                )}
              </div>
              <span>{user.fullName}</span>
            </div>

            <span
              className={`h-2 w-2 rounded-full ${
                onlineUsers.includes(user._id) ? "bg-green-400" : "bg-gray-500"
              }`}
            />
          </div>
        ))
      )}

    </div>
  );
}

export default Sidebar;
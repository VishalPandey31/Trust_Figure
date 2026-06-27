import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Key, Lock, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";

function ProfilePage() {
    const { authUser, updateAvatar, updatePassword, updateVaultPin, deleteAccount } = useAuthStore();
    
    const [avatarPreview, setAvatarPreview] = useState(authUser?.avatar || "");
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
    const [pinData, setPinData] = useState({ oldPin: "", newPin: "" });

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            setAvatarPreview(reader.result);
            const formData = new FormData();
            formData.append("avatar", file);
            
            try {
                await updateAvatar(formData);
                toast.success("Avatar updated!");
            } catch (error) {
                toast.error("Failed to update avatar");
                setAvatarPreview(authUser?.avatar || "");
            }
        };
    };

    const handlePasswordChange = async () => {
        if (!passwordData.oldPassword || passwordData.newPassword.length < 8) {
            return toast.error("New password must be at least 8 characters");
        }
        try {
            await updatePassword(passwordData);
            toast.success("Password updated!");
            setPasswordData({ oldPassword: "", newPassword: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
        }
    };

    const handlePinChange = async () => {
        if (!pinData.oldPin || pinData.newPin.length !== 6) {
            return toast.error("New PIN must be exactly 6 digits");
        }
        try {
            await updateVaultPin(pinData);
            toast.success("Vault PIN updated!");
            setPinData({ oldPin: "", newPin: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update PIN");
        }
    };

    const handleDeleteAccount = async () => {
        const confirmStr = prompt("Type 'DELETE' to confirm account deletion. This action is irreversible.");
        if (confirmStr === "DELETE") {
            try {
                await deleteAccount();
                toast.success("Account deleted");
            } catch (error) {
                toast.error("Failed to delete account");
            }
        }
    };

    if (!authUser) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                
                <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

                {/* Avatar Section */}
                <div className="bg-white/5 p-6 rounded-2xl flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-[#6c63ff]">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-full h-full p-4 text-gray-500" />
                            )}
                        </div>
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                            <Camera size={24} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{authUser.fullName}</h2>
                        <p className="text-gray-400">@{authUser.username}</p>
                        <p className="text-gray-400">{authUser.email}</p>
                    </div>
                </div>

                {/* Password Section */}
                <div className="bg-white/5 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4 text-[#00d4ff]">
                        <Key size={20} />
                        <h2 className="text-xl font-semibold">Change Password</h2>
                    </div>
                    <div className="space-y-4">
                        <input 
                            type="password" placeholder="Old Password"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                            className="w-full p-3 bg-black/30 rounded border border-white/10"
                        />
                        <input 
                            type="password" placeholder="New Password (min 8 chars)"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full p-3 bg-black/30 rounded border border-white/10"
                        />
                        <button onClick={handlePasswordChange} className="bg-[#00d4ff] text-black px-6 py-2 rounded font-medium hover:bg-[#00b3d7] transition">
                            Update Password
                        </button>
                    </div>
                </div>

                {/* Vault PIN Section */}
                <div className="bg-white/5 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4 text-[#6c63ff]">
                        <Lock size={20} />
                        <h2 className="text-xl font-semibold">Change Vault PIN</h2>
                    </div>
                    <div className="space-y-4">
                        <input 
                            type="password" placeholder="Old 6-digit PIN" maxLength={6}
                            value={pinData.oldPin}
                            onChange={(e) => setPinData({...pinData, oldPin: e.target.value})}
                            className="w-full p-3 bg-black/30 rounded border border-white/10"
                        />
                        <input 
                            type="password" placeholder="New 6-digit PIN" maxLength={6}
                            value={pinData.newPin}
                            onChange={(e) => setPinData({...pinData, newPin: e.target.value})}
                            className="w-full p-3 bg-black/30 rounded border border-white/10"
                        />
                        <button onClick={handlePinChange} className="bg-[#6c63ff] text-white px-6 py-2 rounded font-medium hover:bg-[#5a52d5] transition">
                            Update PIN
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-red-500">
                        <Trash2 size={20} />
                        <h2 className="text-xl font-semibold">Danger Zone</h2>
                    </div>
                    <p className="text-red-400 mb-4 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
                    <button onClick={handleDeleteAccount} className="bg-red-500 text-white px-6 py-2 rounded font-medium hover:bg-red-600 transition">
                        Delete Account
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ProfilePage;
